# backend/routes/notifications.py
from flask import Blueprint, jsonify, request
from flask_jwt_extended import jwt_required, get_jwt_identity
from models import db, Notification

notifications_bp = Blueprint("notifications", __name__)


@notifications_bp.route("/notifications", methods=["GET"])
@jwt_required()
def list_notifications():
    """Retrieve user notifications, sorted newest first."""
    current_user_id = int(get_jwt_identity())
    limit = int(request.args.get("limit", 20))

    notifs = (
        Notification.query
        .filter_by(user_id=current_user_id)
        .order_by(Notification.created_at.desc())
        .limit(limit)
        .all()
    )

    unread_count = Notification.query.filter_by(user_id=current_user_id, is_read=False).count()

    return jsonify({
        "notifications": [n.to_dict() for n in notifs],
        "unread_count": unread_count,
    }), 200


@notifications_bp.route("/notifications/<int:notification_id>/read", methods=["PATCH"])
@jwt_required()
def mark_notification_read(notification_id):
    """Mark a specific notification as read."""
    current_user_id = int(get_jwt_identity())
    notif = Notification.query.filter_by(id=notification_id, user_id=current_user_id).first()

    if not notif:
        return jsonify({"msg": "Notification not found"}), 404

    notif.is_read = True
    db.session.commit()
    return jsonify({"msg": "Marked as read", "notification": notif.to_dict()}), 200


@notifications_bp.route("/notifications/read-all", methods=["POST"])
@jwt_required()
def mark_all_read():
    """Mark all notifications for the current user as read."""
    current_user_id = int(get_jwt_identity())
    Notification.query.filter_by(user_id=current_user_id, is_read=False).update({"is_read": True})
    db.session.commit()
    return jsonify({"msg": "All notifications marked as read"}), 200
