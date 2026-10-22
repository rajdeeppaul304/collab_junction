# backend/routes/offers.py
from flask import Blueprint, request, jsonify, current_app
from flask_jwt_extended import jwt_required, get_jwt_identity, get_jwt
from models import db, User, UserRole, Product, Offer, OfferStatus, OfferHistory, Notification
from utils.email import send_marketplace_notification_email
from extensions import socketio
from datetime import datetime

offers_bp = Blueprint("offers", __name__)


def _emit_notification_to_user(user_id, notif_data):
    """Safely emit real-time WebSocket notification to a user's private room."""
    try:
        room_name = f"user_{user_id}"
        socketio.emit("notification_new", notif_data, room=room_name)
    except Exception as exc:
        current_app.logger.warning(f"Socket emit failed for user {user_id}: {exc}")


def _create_and_notify(user_id, notif_type, title, message, link, email=None, email_subject=None):
    """Persists a notification, emits real-time WebSocket event, and sends email alert."""
    notif = Notification(
        user_id=user_id,
        type=notif_type,
        title=title,
        message=message,
        link=link,
    )
    db.session.add(notif)
    db.session.flush()

    _emit_notification_to_user(user_id, notif.to_dict())

    if email:
        send_marketplace_notification_email(
            to_email=email,
            subject=email_subject or title,
            heading=title,
            body_text=message,
            cta_text="View Offer",
            cta_path=link or "/offers",
        )


@offers_bp.route("/offers", methods=["POST"])
@jwt_required()
def create_offer():
    """Brand creates an offer to a creator, or creator initiates an offer on a product."""
    current_user_id = int(get_jwt_identity())
    claims = get_jwt()
    current_role = claims.get("role") or "UNKNOWN"

    data = request.get_json() or {}
    product_id = data.get("product_id")
    creator_id = data.get("creator_id")
    budget = data.get("budget")
    terms = data.get("terms", "").strip()

    if not product_id or budget is None:
        return jsonify({"msg": "Product ID and budget are required"}), 400

    try:
        budget_val = float(budget)
        if budget_val < 0:
            return jsonify({"msg": "Budget must be greater than or equal to 0"}), 400
    except (ValueError, TypeError):
        return jsonify({"msg": "Budget must be a valid number"}), 400

    product = Product.query.get(product_id)
    if not product:
        return jsonify({"msg": "Product not found"}), 404

    # Determine creator & brand
    if current_role == "BRAND":
        if product.brand_id != current_user_id:
            return jsonify({"msg": "You can only make offers on your own products"}), 403
        if not creator_id:
            return jsonify({"msg": "Creator ID is required when a brand creates an offer"}), 400
        creator = User.query.get(creator_id)
        if not creator or creator.user_role != UserRole.CREATOR:
            return jsonify({"msg": "Target creator user not found"}), 404
        actual_creator_id = creator.id
        brand_user = product.brand
    else:  # CREATOR
        actual_creator_id = current_user_id
        creator = User.query.get(current_user_id)
        brand_user = product.brand

    # Check if there is already an active (PENDING or COUNTERED) offer between these parties on this product
    existing_active = Offer.query.filter(
        Offer.product_id == product_id,
        Offer.creator_id == actual_creator_id,
        Offer.status.in_([OfferStatus.PENDING, OfferStatus.COUNTERED])
    ).first()

    if existing_active:
        return jsonify({
            "msg": f"An active offer #{existing_active.id} is already in negotiation for this product.",
            "offer": existing_active.to_dict()
        }), 409

    offer = Offer(
        creator_id=actual_creator_id,
        product_id=product_id,
        budget=budget_val,
        terms=terms,
        status=OfferStatus.PENDING,
        last_action_by=current_user_id,
        version=1,
    )
    db.session.add(offer)
    db.session.flush()

    # Initial history log
    history = OfferHistory(
        offer_id=offer.id,
        actor_id=current_user_id,
        action="created",
        previous_status=None,
        new_status=OfferStatus.PENDING.value,
        budget=budget_val,
        notes=terms or "Initial offer submitted.",
    )
    db.session.add(history)

    # Notify counterparty
    counterparty_id = actual_creator_id if current_user_id == brand_user.id else brand_user.id
    counterparty = User.query.get(counterparty_id)
    initiator_name = (brand_user.brand_profile.brand_name if brand_user.brand_profile else brand_user.name) if current_role == "BRAND" else creator.name

    _create_and_notify(
        user_id=counterparty_id,
        notif_type="offer_new",
        title=f"New Offer on {product.name}",
        message=f"{initiator_name} sent an offer of ₹{budget_val:,.2f}.\nTerms: {terms or 'Standard collaboration'}",
        link=f"/offers/{offer.id}",
        email=counterparty.email if counterparty else None,
        email_subject=f"New Offer Received for {product.name} - Collab Junction",
    )

    db.session.commit()

    return jsonify({
        "msg": "Offer created successfully",
        "offer": offer.to_dict(),
    }), 201


@offers_bp.route("/offers", methods=["GET"])
@jwt_required()
def list_offers():
    """List offers for current user (filtered for Brand or Creator)."""
    current_user_id = int(get_jwt_identity())
    claims = get_jwt()
    current_role = claims.get("role") or "UNKNOWN"

    status_filter = request.args.get("status")

    if current_role == "BRAND":
        query = Offer.query.join(Product, Offer.product_id == Product.id).filter(Product.brand_id == current_user_id)
    else:
        query = Offer.query.filter(Offer.creator_id == current_user_id)

    if status_filter:
        try:
            status_enum = OfferStatus(status_filter.lower())
            query = query.filter(Offer.status == status_enum)
        except ValueError:
            pass

    offers = query.order_by(Offer.updated_at.desc()).all()
    return jsonify([o.to_dict() for o in offers]), 200


@offers_bp.route("/offers/<int:offer_id>", methods=["GET"])
@jwt_required()
def get_offer_detail(offer_id):
    """Retrieve full detail of an offer including negotiation history audit trail."""
    current_user_id = int(get_jwt_identity())

    offer = Offer.query.get(offer_id)
    if not offer:
        return jsonify({"msg": "Offer not found"}), 404

    # Security check: User must be either the creator or the product's brand owner
    is_creator = offer.creator_id == current_user_id
    is_brand = offer.product and offer.product.brand_id == current_user_id
    if not (is_creator or is_brand):
        return jsonify({"msg": "Access denied"}), 403

    history_records = [h.to_dict() for h in offer.history]
    payments_records = [p.to_dict() for p in offer.payments]

    res = offer.to_dict()
    res["history"] = history_records
    res["payments"] = payments_records
    res["is_creator"] = is_creator
    res["is_brand"] = is_brand

    return jsonify(res), 200


@offers_bp.route("/offers/<int:offer_id>/counter", methods=["POST"])
@jwt_required()
def counter_offer(offer_id):
    """Submit a counter-proposal (budget and/or terms). Valid from PENDING or COUNTERED."""
    current_user_id = int(get_jwt_identity())

    # Row lock (SELECT FOR UPDATE) to eliminate race conditions
    offer = Offer.query.with_for_update().filter_by(id=offer_id).first()
    if not offer:
        return jsonify({"msg": "Offer not found"}), 404

    is_creator = offer.creator_id == current_user_id
    is_brand = offer.product and offer.product.brand_id == current_user_id
    if not (is_creator or is_brand):
        return jsonify({"msg": "Access denied"}), 403

    # Enforced State Machine Guards:
    if offer.status not in [OfferStatus.PENDING, OfferStatus.COUNTERED]:
        return jsonify({"msg": f"Cannot counter an offer that is currently '{offer.status.value}'."}), 400

    # Rule: Cannot counter your own latest proposal without opposing party answering first
    if offer.last_action_by == current_user_id:
        return jsonify({"msg": "You already made the latest proposal. Please wait for the counterparty to respond."}), 400

    data = request.get_json() or {}
    new_budget = data.get("budget")
    notes = data.get("notes", "").strip()

    if new_budget is None:
        return jsonify({"msg": "New proposed budget is required"}), 400

    try:
        new_budget_val = float(new_budget)
        if new_budget_val < 0:
            return jsonify({"msg": "Budget must be >= 0"}), 400
    except (ValueError, TypeError):
        return jsonify({"msg": "Budget must be a valid number"}), 400

    prev_status = offer.status.value
    offer.budget = new_budget_val
    if notes:
        offer.terms = notes
    offer.status = OfferStatus.COUNTERED
    offer.last_action_by = current_user_id
    offer.version += 1
    offer.updated_at = datetime.utcnow()

    # Append immutable audit history
    history = OfferHistory(
        offer_id=offer.id,
        actor_id=current_user_id,
        action="countered",
        previous_status=prev_status,
        new_status=OfferStatus.COUNTERED.value,
        budget=new_budget_val,
        notes=notes or "Counter-offer submitted.",
    )
    db.session.add(history)

    # Counterparty details
    counterparty_id = offer.product.brand_id if is_creator else offer.creator_id
    counterparty = User.query.get(counterparty_id)
    actor = User.query.get(current_user_id)

    _create_and_notify(
        user_id=counterparty_id,
        notif_type="offer_counter",
        title=f"Counter-Offer on {offer.product.name}",
        message=f"{actor.name} proposed a counter-offer of ₹{new_budget_val:,.2f}.\nNotes: {notes or 'No extra notes'}",
        link=f"/offers/{offer.id}",
        email=counterparty.email if counterparty else None,
        email_subject=f"Counter-Offer for {offer.product.name} - Collab Junction",
    )

    db.session.commit()

    # Real-time state update broadcast to active offer chat/negotiation room
    socketio.emit("offer_status_changed", offer.to_dict(), room=f"offer_{offer.id}")

    return jsonify({
        "msg": "Counter-offer submitted successfully",
        "offer": offer.to_dict(),
    }), 200


@offers_bp.route("/offers/<int:offer_id>/accept", methods=["POST"])
@jwt_required()
def accept_offer(offer_id):
    """Accept the latest proposal. Valid from PENDING or COUNTERED."""
    current_user_id = int(get_jwt_identity())

    offer = Offer.query.with_for_update().filter_by(id=offer_id).first()
    if not offer:
        return jsonify({"msg": "Offer not found"}), 404

    is_creator = offer.creator_id == current_user_id
    is_brand = offer.product and offer.product.brand_id == current_user_id
    if not (is_creator or is_brand):
        return jsonify({"msg": "Access denied"}), 403

    # Enforced State Machine Guards:
    if offer.status not in [OfferStatus.PENDING, OfferStatus.COUNTERED]:
        return jsonify({"msg": f"Cannot accept an offer that is currently '{offer.status.value}'."}), 400

    # Rule: You cannot accept your own proposal (the other party must accept it)
    if offer.last_action_by == current_user_id:
        return jsonify({"msg": "You cannot accept your own proposal. The other party must accept it."}), 400

    prev_status = offer.status.value
    offer.status = OfferStatus.ACCEPTED
    offer.last_action_by = current_user_id
    offer.version += 1
    offer.updated_at = datetime.utcnow()

    history = OfferHistory(
        offer_id=offer.id,
        actor_id=current_user_id,
        action="accepted",
        previous_status=prev_status,
        new_status=OfferStatus.ACCEPTED.value,
        budget=offer.budget,
        notes="Offer accepted by " + ("Creator" if is_creator else "Brand"),
    )
    db.session.add(history)

    counterparty_id = offer.product.brand_id if is_creator else offer.creator_id
    counterparty = User.query.get(counterparty_id)
    actor = User.query.get(current_user_id)

    _create_and_notify(
        user_id=counterparty_id,
        notif_type="offer_accepted",
        title=f"Deal Accepted! - {offer.product.name}",
        message=f"{actor.name} accepted the collaboration offer for ₹{offer.budget:,.2f}!",
        link=f"/offers/{offer.id}",
        email=counterparty.email if counterparty else None,
        email_subject=f"Deal Accepted for {offer.product.name}! - Collab Junction",
    )

    db.session.commit()

    socketio.emit("offer_status_changed", offer.to_dict(), room=f"offer_{offer.id}")

    return jsonify({
        "msg": "Offer accepted! Deal is confirmed.",
        "offer": offer.to_dict(),
    }), 200


@offers_bp.route("/offers/<int:offer_id>/reject", methods=["POST"])
@jwt_required()
def reject_offer(offer_id):
    """Reject or cancel an offer. Valid from PENDING or COUNTERED."""
    current_user_id = int(get_jwt_identity())

    offer = Offer.query.with_for_update().filter_by(id=offer_id).first()
    if not offer:
        return jsonify({"msg": "Offer not found"}), 404

    is_creator = offer.creator_id == current_user_id
    is_brand = offer.product and offer.product.brand_id == current_user_id
    if not (is_creator or is_brand):
        return jsonify({"msg": "Access denied"}), 403

    if offer.status in [OfferStatus.PAID, OfferStatus.COMPLETED]:
        return jsonify({"msg": "Cannot reject an offer that has already been paid or completed."}), 400

    data = request.get_json() or {}
    reason = data.get("reason", "").strip()

    prev_status = offer.status.value
    # If the person rejecting is the one who made the initial offer, it's a cancellation; otherwise rejection
    new_status = OfferStatus.CANCELLED if offer.last_action_by == current_user_id else OfferStatus.REJECTED
    offer.status = new_status
    offer.last_action_by = current_user_id
    offer.version += 1
    offer.updated_at = datetime.utcnow()

    history = OfferHistory(
        offer_id=offer.id,
        actor_id=current_user_id,
        action=new_status.value,
        previous_status=prev_status,
        new_status=new_status.value,
        budget=offer.budget,
        notes=reason or f"Offer {new_status.value}.",
    )
    db.session.add(history)

    counterparty_id = offer.product.brand_id if is_creator else offer.creator_id
    counterparty = User.query.get(counterparty_id)
    actor = User.query.get(current_user_id)

    _create_and_notify(
        user_id=counterparty_id,
        notif_type="offer_rejected",
        title=f"Offer {new_status.value.capitalize()} - {offer.product.name}",
        message=f"{actor.name} {new_status.value} the offer.\nReason: {reason or 'None provided'}",
        link=f"/offers/{offer.id}",
        email=counterparty.email if counterparty else None,
        email_subject=f"Offer Update for {offer.product.name} - Collab Junction",
    )

    db.session.commit()

    socketio.emit("offer_status_changed", offer.to_dict(), room=f"offer_{offer.id}")

    return jsonify({
        "msg": f"Offer {new_status.value} successfully",
        "offer": offer.to_dict(),
    }), 200


@offers_bp.route("/offers/<int:offer_id>/complete", methods=["POST"])
@jwt_required()
def complete_offer(offer_id):
    """Mark an accepted/paid offer as completed after campaign deliverables are fulfilled."""
    current_user_id = int(get_jwt_identity())

    offer = Offer.query.with_for_update().filter_by(id=offer_id).first()
    if not offer:
        return jsonify({"msg": "Offer not found"}), 404

    is_creator = offer.creator_id == current_user_id
    is_brand = offer.product and offer.product.brand_id == current_user_id
    if not (is_creator or is_brand):
        return jsonify({"msg": "Access denied"}), 403

    if offer.status not in [OfferStatus.ACCEPTED, OfferStatus.PAID]:
        return jsonify({"msg": f"Only accepted or paid offers can be marked completed (current: {offer.status.value})"}), 400

    prev_status = offer.status.value
    offer.status = OfferStatus.COMPLETED
    offer.last_action_by = current_user_id
    offer.version += 1
    offer.updated_at = datetime.utcnow()

    history = OfferHistory(
        offer_id=offer.id,
        actor_id=current_user_id,
        action="completed",
        previous_status=prev_status,
        new_status=OfferStatus.COMPLETED.value,
        budget=offer.budget,
        notes="Deal and campaign deliverables marked completed.",
    )
    db.session.add(history)

    counterparty_id = offer.product.brand_id if is_creator else offer.creator_id
    counterparty = User.query.get(counterparty_id)
    actor = User.query.get(current_user_id)

    _create_and_notify(
        user_id=counterparty_id,
        notif_type="offer_completed",
        title=f"Collaboration Completed! - {offer.product.name}",
        message=f"{actor.name} marked the campaign for {offer.product.name} as completed! Congratulations!",
        link=f"/offers/{offer.id}",
        email=counterparty.email if counterparty else None,
        email_subject=f"Campaign Completed for {offer.product.name}! - Collab Junction",
    )

    db.session.commit()

    socketio.emit("offer_status_changed", offer.to_dict(), room=f"offer_{offer.id}")

    return jsonify({
        "msg": "Offer marked as completed!",
        "offer": offer.to_dict(),
    }), 200
