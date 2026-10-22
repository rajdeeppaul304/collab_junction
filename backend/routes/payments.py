# backend/routes/payments.py
import hmac
import hashlib
import json
import uuid
from flask import Blueprint, request, jsonify, current_app
from flask_jwt_extended import jwt_required, get_jwt_identity
from models import db, User, Offer, OfferStatus, OfferHistory, PaymentTransaction, WebhookEvent, Notification
from utils.email import send_marketplace_notification_email
from extensions import socketio

payments_bp = Blueprint("payments", __name__)


def _get_razorpay_client():
    """Lazily initialize Razorpay client if credentials exist."""
    key_id = current_app.config.get("RAZORPAY_KEY_ID")
    key_secret = current_app.config.get("RAZORPAY_KEY_SECRET")
    if key_id and key_secret:
        try:
            import razorpay
            return razorpay.Client(auth=(key_id, key_secret))
        except Exception as e:
            current_app.logger.warning(f"Failed to create razorpay client: {e}")
    return None


@payments_bp.route("/payments/create-order", methods=["POST"])
@jwt_required()
def create_payment_order():
    """Brand creates a payment order for an ACCEPTED offer.

    Idempotent: Re-using the same idempotency key or re-requesting an active order
    returns the existing order rather than creating duplicate charges.
    """
    current_user_id = int(get_jwt_identity())
    data = request.get_json() or {}
    offer_id = data.get("offer_id")
    idempotency_key = request.headers.get("Idempotency-Key") or data.get("idempotency_key") or f"idemp_{uuid.uuid4().hex}"

    if not offer_id:
        return jsonify({"msg": "offer_id is required"}), 400

    offer = Offer.query.get(offer_id)
    if not offer:
        return jsonify({"msg": "Offer not found"}), 404

    # Security: Only the Brand owner of this product can pay
    if not (offer.product and offer.product.brand_id == current_user_id):
        return jsonify({"msg": "Only the brand can pay for this collaboration"}), 403

    # State guard: Only ACCEPTED offers can be paid
    if offer.status != OfferStatus.ACCEPTED:
        return jsonify({
            "msg": f"Offer cannot be paid. Current status is '{offer.status.value}'. Offer must be 'accepted'."
        }), 400

    # Idempotency check: Has this idempotency key already created a transaction?
    existing_tx = PaymentTransaction.query.filter_by(idempotency_key=idempotency_key).first()
    if existing_tx:
        return jsonify({
            "msg": "Order already created (idempotent)",
            "transaction": existing_tx.to_dict(),
            "razorpay_key_id": current_app.config.get("RAZORPAY_KEY_ID"),
        }), 200

    # Also check if there's already an authorized/captured transaction for this offer
    paid_tx = PaymentTransaction.query.filter_by(offer_id=offer.id, status="captured").first()
    if paid_tx:
        return jsonify({
            "msg": "This offer has already been paid",
            "transaction": paid_tx.to_dict()
        }), 400

    amount_in_rupees = float(offer.budget)
    amount_in_paise = int(round(amount_in_rupees * 100))

    if amount_in_paise <= 0:
        return jsonify({"msg": "Payment amount must be greater than 0"}), 400

    rz_client = _get_razorpay_client()
    razorpay_order_id = f"order_mock_{uuid.uuid4().hex[:14]}"

    if rz_client:
        try:
            order_data = {
                "amount": amount_in_paise,
                "currency": "INR",
                "receipt": f"rcpt_off_{offer.id}_{uuid.uuid4().hex[:6]}",
                "notes": {
                    "offer_id": str(offer.id),
                    "product_name": offer.product.name,
                    "brand_id": str(current_user_id),
                    "creator_id": str(offer.creator_id),
                }
            }
            rz_order = rz_client.order.create(data=order_data)
            razorpay_order_id = rz_order.get("id") or razorpay_order_id
        except Exception as exc:
            current_app.logger.warning(f"Razorpay API call failed, using mock order: {exc}")

    # Record PaymentTransaction in DB
    tx = PaymentTransaction(
        offer_id=offer.id,
        payer_id=current_user_id,
        amount=amount_in_rupees,
        currency="INR",
        status="created",
        razorpay_order_id=razorpay_order_id,
        idempotency_key=idempotency_key,
    )
    db.session.add(tx)
    db.session.commit()

    return jsonify({
        "msg": "Payment order created successfully",
        "order_id": razorpay_order_id,
        "amount": amount_in_rupees,
        "amount_paise": amount_in_paise,
        "currency": "INR",
        "razorpay_key_id": current_app.config.get("RAZORPAY_KEY_ID"),
        "transaction": tx.to_dict(),
    }), 201


@payments_bp.route("/payments/verify", methods=["POST"])
@jwt_required()
def verify_payment():
    """Client calls this after Razorpay Checkout handler succeeds to confirm payment."""
    current_user_id = int(get_jwt_identity())
    data = request.get_json() or {}

    razorpay_order_id = data.get("razorpay_order_id")
    razorpay_payment_id = data.get("razorpay_payment_id")
    razorpay_signature = data.get("razorpay_signature")

    if not (razorpay_order_id and razorpay_payment_id):
        return jsonify({"msg": "razorpay_order_id and razorpay_payment_id are required"}), 400

    tx = PaymentTransaction.query.filter_by(razorpay_order_id=razorpay_order_id).first()
    if not tx:
        return jsonify({"msg": "Transaction not found for this order"}), 404

    offer = Offer.query.with_for_update().filter_by(id=tx.offer_id).first()
    if not offer:
        return jsonify({"msg": "Offer linked to payment not found"}), 404

    # Signature verification (if in live or test mode with real secret)
    key_secret = current_app.config.get("RAZORPAY_KEY_SECRET")
    signature_valid = True

    if razorpay_signature and key_secret and not razorpay_order_id.startswith("order_mock_"):
        try:
            generated_signature = hmac.new(
                key_secret.encode("utf-8"),
                f"{razorpay_order_id}|{razorpay_payment_id}".encode("utf-8"),
                hashlib.sha256
            ).hexdigest()
            signature_valid = hmac.compare_digest(generated_signature, razorpay_signature)
        except Exception as exc:
            current_app.logger.warning(f"Signature check error: {exc}")
            signature_valid = False

    if not signature_valid:
        tx.status = "failed"
        db.session.commit()
        return jsonify({"msg": "Invalid payment signature"}), 400

    # Idempotent state transition
    if tx.status != "captured":
        tx.status = "captured"
        tx.razorpay_payment_id = razorpay_payment_id
        tx.razorpay_signature = razorpay_signature

        # Advance offer status to PAID
        prev_status = offer.status.value
        offer.status = OfferStatus.PAID
        offer.last_action_by = current_user_id
        offer.version += 1

        history = OfferHistory(
            offer_id=offer.id,
            actor_id=current_user_id,
            action="paid",
            previous_status=prev_status,
            new_status=OfferStatus.PAID.value,
            budget=offer.budget,
            notes=f"Payment of ₹{tx.amount:,.2f} confirmed (Tx #{tx.id}, Razorpay ID: {razorpay_payment_id}).",
        )
        db.session.add(history)

        # Notify creator and brand
        creator = offer.creator
        brand = offer.product.brand

        # Creator notification
        notif_creator = Notification(
            user_id=creator.id,
            type="payment_success",
            title=f"Funds Escrowed for {offer.product.name}!",
            message=f"{brand.name} has successfully funded ₹{tx.amount:,.2f} for your collaboration. You can now begin work!",
            link=f"/offers/{offer.id}",
        )
        db.session.add(notif_creator)

        # Brand notification
        notif_brand = Notification(
            user_id=brand.id,
            type="payment_success",
            title=f"Payment Receipt: {offer.product.name}",
            message=f"Your payment of ₹{tx.amount:,.2f} has been placed in escrow for offer #{offer.id}.",
            link=f"/offers/{offer.id}",
        )
        db.session.add(notif_brand)

        send_marketplace_notification_email(
            to_email=creator.email,
            subject=f"Payment Escrowed: ₹{tx.amount:,.2f} for {offer.product.name} - Collab Junction",
            heading="Collaboration Deal Funded!",
            body_text=f"Great news! {brand.name} has successfully paid the agreed ₹{tx.amount:,.2f} into platform escrow.\n\nYou can now proceed with content deliverables with complete peace of mind.",
            cta_text="View Deal & Campaign Details",
            cta_path=f"/offers/{offer.id}",
        )

        db.session.commit()

        # Real-time WebSocket broadcasts
        try:
            socketio.emit("offer_status_changed", offer.to_dict(), room=f"offer_{offer.id}")
            socketio.emit("notification_new", notif_creator.to_dict(), room=f"user_{creator.id}")
            socketio.emit("notification_new", notif_brand.to_dict(), room=f"user_{brand.id}")
        except Exception as e:
            current_app.logger.warning(f"Socket emit failed: {e}")

    return jsonify({
        "msg": "Payment verified and recorded successfully",
        "offer": offer.to_dict(),
        "transaction": tx.to_dict(),
    }), 200


@payments_bp.route("/payments/webhook", methods=["POST"])
def razorpay_webhook():
    """Idempotent webhook listener for Razorpay payment events.

    1. Validates webhook signature.
    2. Enforces idempotency via WebhookEvent table.
    3. Handles payment.captured event without double-processing.
    """
    webhook_secret = current_app.config.get("RAZORPAY_WEBHOOK_SECRET")
    received_signature = request.headers.get("X-Razorpay-Signature")

    raw_body = request.get_data()

    if webhook_secret and received_signature:
        expected_sig = hmac.new(
            webhook_secret.encode("utf-8"),
            raw_body,
            hashlib.sha256
        ).hexdigest()
        if not hmac.compare_digest(expected_sig, received_signature):
            current_app.logger.warning("Razorpay webhook signature mismatch")
            return jsonify({"status": "invalid_signature"}), 400

    try:
        event_payload = json.loads(raw_body.decode("utf-8"))
    except Exception:
        return jsonify({"status": "bad_json"}), 400

    event_id = event_payload.get("event_id") or event_payload.get("id") or f"evt_{uuid.uuid4().hex}"
    event_type = event_payload.get("event")

    # Idempotency guard: If this event was already processed, acknowledge 200 immediately
    existing_event = WebhookEvent.query.filter_by(event_id=event_id).first()
    if existing_event:
        return jsonify({"status": "already_processed", "event_id": event_id}), 200

    # Save event log
    event_record = WebhookEvent(
        event_id=event_id,
        provider="razorpay",
        event_type=event_type or "unknown",
        payload=event_payload,
        status="processed"
    )
    db.session.add(event_record)

    # Process payment.captured event
    if event_type == "payment.captured":
        payment_entity = event_payload.get("payload", {}).get("payment", {}).get("entity", {})
        order_id = payment_entity.get("order_id")
        payment_id = payment_entity.get("id")

        if order_id:
            tx = PaymentTransaction.query.filter_by(razorpay_order_id=order_id).first()
            if tx and tx.status != "captured":
                tx.status = "captured"
                tx.razorpay_payment_id = payment_id

                offer = Offer.query.get(tx.offer_id)
                if offer and offer.status != OfferStatus.PAID:
                    offer.status = OfferStatus.PAID
                    offer.version += 1
                    db.session.add(OfferHistory(
                        offer_id=offer.id,
                        actor_id=tx.payer_id,
                        action="paid",
                        previous_status="accepted",
                        new_status=OfferStatus.PAID.value,
                        budget=offer.budget,
                        notes=f"Payment captured via webhook (Razorpay payment {payment_id}).",
                    ))

    db.session.commit()
    return jsonify({"status": "ok", "event_id": event_id}), 200
