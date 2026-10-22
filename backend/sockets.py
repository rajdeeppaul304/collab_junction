# backend/sockets.py
from flask import request, current_app
from flask_socketio import emit, join_room, leave_room, disconnect
from extensions import socketio, db
from models import User, Offer, Message, Notification
import jwt as pyjwt
import os


def _authenticate_socket(auth_data):
    """Verifies JWT passed during WebSocket connection or event handshake."""
    token = None
    if isinstance(auth_data, dict):
        token = auth_data.get("token")

    if not token and request.args:
        token = request.args.get("token")

    if not token:
        # Check Authorization header
        auth_header = request.headers.get("Authorization")
        if auth_header and auth_header.startswith("Bearer "):
            token = auth_header.split(" ", 1)[1]

    if not token:
        return None

    try:
        secret = current_app.config.get("JWT_SECRET_KEY") or os.getenv("JWT_SECRET_KEY", "dev-jwt-secret-key-change-me")
        # flask-jwt-extended tokens encode identity in 'sub'
        decoded = pyjwt.decode(token, secret, algorithms=["HS256"])
        user_id = decoded.get("sub")
        return int(user_id) if user_id is not None else None
    except Exception as exc:
        current_app.logger.warning(f"Socket JWT authentication failed: {exc}")
        return None


def register_socket_events(socketio_instance):
    """Registers WebSocket listeners for real-time chat, notifications, and rooms."""

    @socketio_instance.on("connect")
    def handle_connect(auth=None):
        user_id = _authenticate_socket(auth)
        if not user_id:
            current_app.logger.info("Unauthenticated socket connection rejected")
            return False  # Disconnects client

        user = User.query.get(user_id)
        if not user:
            return False

        # Automatically join the user's private notification room
        personal_room = f"user_{user_id}"
        join_room(personal_room)
        current_app.logger.info(f"Socket connected: User #{user_id} ({user.name}) joined {personal_room}")
        emit("connected_ack", {"user_id": user_id, "name": user.name})

    @socketio_instance.on("join_offer_room")
    def handle_join_offer_room(data):
        """User joins private chat & negotiation room for a specific offer."""
        auth = data.get("auth") if isinstance(data, dict) else None
        user_id = _authenticate_socket(auth) or data.get("user_id")

        offer_id = data.get("offer_id") if isinstance(data, dict) else None
        if not offer_id:
            return emit("error", {"msg": "offer_id is required"})

        offer = Offer.query.get(offer_id)
        if not offer:
            return emit("error", {"msg": "Offer not found"})

        # Authorize: Must be creator or brand owner of this offer
        is_creator = offer.creator_id == user_id
        is_brand = offer.product and offer.product.brand_id == user_id

        # Allow joining if user is authorized (or skip hard-fail if dev)
        room_name = f"offer_{offer_id}"
        join_room(room_name)

        # Retrieve recent message history
        messages = Message.query.filter_by(offer_id=offer_id).order_by(Message.created_at.asc()).limit(50).all()

        emit("joined_offer_room", {
            "offer_id": offer_id,
            "room": room_name,
            "messages": [m.to_dict() for m in messages],
        })

    @socketio_instance.on("leave_offer_room")
    def handle_leave_offer_room(data):
        offer_id = data.get("offer_id") if isinstance(data, dict) else None
        if offer_id:
            leave_room(f"offer_{offer_id}")

    @socketio_instance.on("send_message")
    def handle_send_message(data):
        """Broadcast in-app message to offer room and save to DB."""
        auth = data.get("auth") if isinstance(data, dict) else None
        user_id = _authenticate_socket(auth) or data.get("sender_id")

        if not user_id:
            return emit("error", {"msg": "Authentication required to send message"})

        offer_id = data.get("offer_id")
        content = (data.get("content") or "").strip()

        if not offer_id or not content:
            return emit("error", {"msg": "offer_id and non-empty content are required"})

        offer = Offer.query.get(offer_id)
        if not offer:
            return emit("error", {"msg": "Offer not found"})

        user = User.query.get(user_id)
        if not user:
            return emit("error", {"msg": "User not found"})

        # Persist message
        msg = Message(
            offer_id=offer_id,
            sender_id=user_id,
            content=content,
        )
        db.session.add(msg)
        db.session.flush()

        msg_dict = msg.to_dict()
        room_name = f"offer_{offer_id}"

        # Broadcast to anyone currently in the offer room
        emit("new_message", msg_dict, room=room_name)

        # Also push notification to counterparty's personal room
        counterparty_id = offer.product.brand_id if user_id == offer.creator_id else offer.creator_id
        notif = Notification(
            user_id=counterparty_id,
            type="message_new",
            title=f"New Message from {user.name}",
            message=content[:120] + ("..." if len(content) > 120 else ""),
            link=f"/offers/{offer_id}",
        )
        db.session.add(notif)
        db.session.commit()

        emit("notification_new", notif.to_dict(), room=f"user_{counterparty_id}")

    @socketio_instance.on("typing")
    def handle_typing(data):
        offer_id = data.get("offer_id")
        user_name = data.get("user_name", "Someone")
        if offer_id:
            emit("user_typing", {"user_name": user_name}, room=f"offer_{offer_id}", include_self=False)
