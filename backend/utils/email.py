# backend/utils/email.py
import os
import socket
import threading
import requests
from flask_mail import Message
from extensions import mail
from flask import current_app


def _send_brevo_email(api_key, sender_email, sender_name, to_email, subject, html_content, text_content):
    """Send email via Brevo's HTTP API (port 443 - works everywhere, free to any recipient)."""
    response = requests.post(
        "https://api.brevo.com/v3/smtp/email",
        headers={
            "api-key": api_key,
            "Content-Type": "application/json",
            "Accept": "application/json",
        },
        json={
            "sender": {"name": sender_name, "email": sender_email},
            "to": [{"email": to_email}],
            "subject": subject,
            "htmlContent": html_content,
            "textContent": text_content,
        },
        timeout=10,
    )
    if not response.ok:
        raise RuntimeError(f"Brevo HTTP API failed with status {response.status_code}: {response.text}")
    return response.json()


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

        # 1. Try Brevo API first (Recommended for arbitrary recipients without custom domain)
        brevo_api_key = app.config.get("BREVO_API_KEY")
        if brevo_api_key:
            try:
                sender_email = app.config.get("BREVO_SENDER_EMAIL") or app.config.get("MAIL_USERNAME") or to_email
                sender_name = app.config.get("BREVO_SENDER_NAME", "Collab Junction")
                _send_brevo_email(brevo_api_key, sender_email, sender_name, to_email, subject, html_content, text_content)
                app.logger.info(f"Verification email sent via Brevo API to {to_email}")
                return
            except Exception as exc:
                app.logger.warning(f"Brevo API email failed for {to_email}: {exc}")

        # 2. Try Resend API
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

    brevo_configured = bool(current_app.config.get("BREVO_API_KEY"))
    resend_configured = bool(current_app.config.get("RESEND_API_KEY"))
    smtp_configured = bool(current_app.config.get("MAIL_USERNAME") and current_app.config.get("MAIL_PASSWORD"))

    if not brevo_configured and not resend_configured and not smtp_configured:
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


def _send_notification_email_worker(app, to_email, subject, heading, body_text, cta_text, cta_link):
    with app.app_context():
        text_content = f"{heading}\n\n{body_text}\n\nView details: {cta_link}"
        html_content = f"""
        <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; border: 1px solid #27272a; border-radius: 12px; background-color: #18181b; color: #f4f4f5;">
            <div style="margin-bottom: 20px;">
                <span style="background-color: #facc15; color: #000; font-size: 11px; font-weight: 800; padding: 4px 10px; border-radius: 9999px; text-transform: uppercase; letter-spacing: 0.05em;">Collab Junction</span>
            </div>
            <h2 style="color: #facc15; margin-top: 0; font-size: 22px;">{heading}</h2>
            <p style="color: #d4d4d8; font-size: 15px; line-height: 1.6; white-space: pre-line;">{body_text}</p>
            <div style="margin: 32px 0;">
                <a href="{cta_link}" style="background-color: #facc15; color: #000000; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: 700; font-size: 14px; display: inline-block;">
                    {cta_text} &rarr;
                </a>
            </div>
            <hr style="border: none; border-top: 1px solid #27272a; margin: 24px 0;" />
            <p style="color: #71717a; font-size: 12px; margin: 0;">Collab Junction Platform Notification &bull; <a href="{cta_link}" style="color: #a1a1aa;">Open Dashboard</a></p>
        </div>
        """

        # 1. Brevo
        brevo_key = app.config.get("BREVO_API_KEY")
        if brevo_key:
            try:
                sender_email = app.config.get("BREVO_SENDER_EMAIL") or "no-reply@collabjunction.com"
                sender_name = app.config.get("BREVO_SENDER_NAME", "Collab Junction")
                _send_brevo_email(brevo_key, sender_email, sender_name, to_email, subject, html_content, text_content)
                app.logger.info(f"Notification email dispatched via Brevo to {to_email}")
                return
            except Exception as exc:
                app.logger.warning(f"Brevo notification email failed for {to_email}: {exc}")

        # 2. Resend
        resend_key = app.config.get("RESEND_API_KEY")
        if resend_key:
            try:
                from_email = app.config.get("RESEND_FROM", "Collab Junction <onboarding@resend.dev>")
                _send_resend_email(resend_key, from_email, to_email, subject, html_content, text_content)
                app.logger.info(f"Notification email dispatched via Resend to {to_email}")
                return
            except Exception as exc:
                app.logger.warning(f"Resend notification email failed for {to_email}: {exc}")

        # 3. SMTP fallback
        if bool(app.config.get("MAIL_USERNAME") and app.config.get("MAIL_PASSWORD")):
            default_timeout = socket.getdefaulttimeout()
            try:
                socket.setdefaulttimeout(5)
                msg = Message(subject=subject, recipients=[to_email])
                msg.body = text_content
                msg.html = html_content
                mail.send(msg)
                app.logger.info(f"Notification email dispatched via SMTP to {to_email}")
            except Exception as exc:
                app.logger.warning(f"SMTP notification failed for {to_email}: {exc}")
            finally:
                socket.setdefaulttimeout(default_timeout)


def send_marketplace_notification_email(to_email, subject, heading, body_text, cta_text="View in Dashboard", cta_path="/dashboard/brand"):
    """Dispatches a branded marketplace notification email asynchronously in background thread."""
    if not to_email:
        return
    frontend_url = current_app.config.get("FRONTEND_URL") or os.getenv("FRONTEND_URL", "http://localhost:5173")
    cta_link = f"{frontend_url.rstrip('/')}{cta_path if cta_path.startswith('/') else '/' + cta_path}"

    app = current_app._get_current_object()
    thread = threading.Thread(
        target=_send_notification_email_worker,
        args=(app, to_email, subject, heading, body_text, cta_text, cta_link)
    )
    thread.daemon = True
    thread.start()

