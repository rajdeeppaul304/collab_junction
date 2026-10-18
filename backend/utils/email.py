# backend/utils/email.py
import os
import socket
import threading
import requests
from flask_mail import Message
from extensions import mail
from flask import current_app


def _send_resend_email(api_key, from_email, to_email, subject, html_content, text_content):
    """Send email via Resend's HTTP API (port 443 - never blocked by cloud firewalls)."""
    response = requests.post(
        "https://api.resend.com/emails",
        headers={
            "Authorization": f"Bearer {api_key}",
            "Content-Type": "application/json",
        },
        json={
            "from": from_email,
            "to": [to_email],
            "subject": subject,
            "html": html_content,
            "text": text_content,
        },
        timeout=10,
    )
    if not response.ok:
        raise RuntimeError(f"Resend HTTP API failed with status {response.status_code}: {response.text}")
    return response.json()


def _send_async_email(app, to_email, verify_link):
    with app.app_context():
        subject = "Verify your account - Collab Junction"
        text_content = (
            f"Welcome to Collab Junction!\n\n"
            f"Please verify your account by clicking the link below:\n{verify_link}\n\n"
            f"If you didn't create this account, you can safely ignore this email."
        )
        html_content = f"""
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 8px;">
            <h2 style="color: #6366f1;">Welcome to Collab Junction!</h2>
            <p style="color: #475569; font-size: 16px;">Please confirm your email address by clicking the button below:</p>
            <div style="margin: 30px 0;">
                <a href="{verify_link}" style="background-color: #6366f1; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">
                    Verify My Account
                </a>
            </div>
            <p style="color: #94a3b8; font-size: 13px;">Or copy and paste this link in your browser:<br/><a href="{verify_link}">{verify_link}</a></p>
        </div>
        """

        resend_api_key = app.config.get("RESEND_API_KEY")
        if resend_api_key:
            try:
                from_email = app.config.get("RESEND_FROM", "Collab Junction <onboarding@resend.dev>")
                _send_resend_email(resend_api_key, from_email, to_email, subject, html_content, text_content)
                app.logger.info(f"Verification email sent via Resend API to {to_email}")
                return
            except Exception as exc:
                app.logger.warning(f"Resend API email failed for {to_email}: {exc}")

        # Fallback to standard SMTP if configured
        smtp_configured = bool(app.config.get("MAIL_USERNAME") and app.config.get("MAIL_PASSWORD"))
        if smtp_configured:
            default_timeout = socket.getdefaulttimeout()
            try:
                socket.setdefaulttimeout(5)
                msg = Message(subject=subject, recipients=[to_email])
                msg.body = text_content
                msg.html = html_content
                mail.send(msg)
                app.logger.info(f"Verification email sent via SMTP to {to_email}")
            except Exception as exc:
                app.logger.warning(f"SMTP email failed for {to_email}: {exc}")
            finally:
                socket.setdefaulttimeout(default_timeout)


def send_verification_email(email, token):
    """Send the account verification email.

    Tries Resend HTTPS API first (ideal for Render & cloud deployment),
    falls back to SMTP, and logs the link if neither is active.
    """
    frontend_url = current_app.config.get("FRONTEND_URL") or os.getenv("FRONTEND_URL", "http://localhost:5173")
    verify_link = f"{frontend_url}/verify/{token}"

    resend_configured = bool(current_app.config.get("RESEND_API_KEY"))
    smtp_configured = bool(current_app.config.get("MAIL_USERNAME") and current_app.config.get("MAIL_PASSWORD"))

    if not resend_configured and not smtp_configured:
        current_app.logger.info(f"[MAIL_NOT_CONFIGURED] Verification link for {email}: {verify_link}")
        return verify_link

    try:
        app = current_app._get_current_object()
        thread = threading.Thread(target=_send_async_email, args=(app, email, verify_link))
        thread.daemon = True
        thread.start()
    except Exception as exc:
        current_app.logger.warning(f"Failed to queue verification email to {email}: {exc}")

    return verify_link
