# backend/utils/email.py
from flask_mail import Message
from extensions import mail  # ✅ import the initialized instance
from flask import current_app

def send_verification_email(email, token):
    msg = Message('Verify your account', recipients=[email])
    msg.body = f"Your verification link is: http://localhost:5173/verify/{token}"
    mail.send(msg)
