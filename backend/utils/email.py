# backend/utils/email.py
import os
from flask_mail import Message
from extensions import mail  # import the initialized instance
from flask import current_app


def send_verification_email(email, token):
    """Send the account verification email.

    In local/dev environments where mail credentials aren't configured,
    Flask-Mail is set to MAIL_SUPPRESS_SEND, so this becomes a safe no-op
    instead of raising and breaking signup. We still log the link so it's
    easy to verify accounts manually during development.
    """
    frontend_url = current_app.config.get("FRONTEND_URL") or os.getenv("FRONTEND_URL", "http://localhost:5173")
    verify_link = f"{frontend_url}/verify/{token}"

    try:
        msg = Message('Verify your account', recipients=[email])
        msg.body = (
            f"Welcome to Collab Junction!\n\n"
            f"Please verify your account by clicking the link below:\n{verify_link}\n\n"
            f"If you didn't create this account, you can safely ignore this email."
        )
        mail.send(msg)
    except Exception as exc:  # noqa: BLE001 - never let email failures break signup
        current_app.logger.warning(f"Could not send verification email to {email}: {exc}")

    if current_app.config.get("MAIL_SUPPRESS_SEND"):
        current_app.logger.info(f"[DEV] Verification link for {email}: {verify_link}")
