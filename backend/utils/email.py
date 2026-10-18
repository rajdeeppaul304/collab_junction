# backend/utils/email.py
import os
import socket
import threading
from flask_mail import Message
from extensions import mail
from flask import current_app


def _send_async_email(app, msg, email):
    with app.app_context():
        default_timeout = socket.getdefaulttimeout()
        try:
            # Enforce 5s socket timeout so SMTP cannot block Gunicorn workers
            socket.setdefaulttimeout(5)
            mail.send(msg)
            app.logger.info(f"Verification email sent to {email}")
        except Exception as exc:
            app.logger.warning(f"Could not send verification email to {email}: {exc}")
        finally:
            socket.setdefaulttimeout(default_timeout)


def send_verification_email(email, token):
    """Send the account verification email.

    If mail credentials are not configured or MAIL_SUPPRESS_SEND is set,
    this becomes a safe no-op that logs the verification link, preventing
    SMTP timeouts or worker crashes.
    When configured, sending runs in a background thread so the HTTP
    signup response is returned immediately.
    """
    frontend_url = current_app.config.get("FRONTEND_URL") or os.getenv("FRONTEND_URL", "http://localhost:5173")
    verify_link = f"{frontend_url}/verify/{token}"

    is_suppressed = current_app.config.get("MAIL_SUPPRESS_SEND") or not (
        current_app.config.get("MAIL_USERNAME") and current_app.config.get("MAIL_PASSWORD")
    )

    if is_suppressed:
        current_app.logger.info(f"[MAIL_NOT_CONFIGURED] Verification link for {email}: {verify_link}")
        return verify_link

    try:
        msg = Message('Verify your account', recipients=[email])
        msg.body = (
            f"Welcome to Collab Junction!\n\n"
            f"Please verify your account by clicking the link below:\n{verify_link}\n\n"
            f"If you didn't create this account, you can safely ignore this email."
        )
        app = current_app._get_current_object()
        thread = threading.Thread(target=_send_async_email, args=(app, msg, email))
        thread.daemon = True
        thread.start()
    except Exception as exc:
        current_app.logger.warning(f"Failed to queue verification email to {email}: {exc}")

    return verify_link
