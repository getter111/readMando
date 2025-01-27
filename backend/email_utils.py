from fastapi_mail import FastMail, MessageSchema, ConnectionConfig
from typing import List
import os

config = ConnectionConfig(
    MAIL_USERNAME = os.getenv("MAIL_USERNAME"), #could use small email
    MAIL_PASSWORD = os.getenv("MAIL_PASSWORD"), 
    MAIL_FROM = os.getenv("MAIL_FROM"), #could use same email
    MAIL_PORT = 587,
    MAIL_SERVER = "smtp.gmail.com",  # email server
    MAIL_SSL_TLS = False,
    MAIL_STARTTLS = True,
    USE_CREDENTIALS = True
)

async def send_verification_email(email: str, verification_token: str):
    html = f"""
        <p>Please verify your email by clicking the link below:</p>
        <p>
            <a href="http://yourdomain.com/verify/{verification_token}">
                Verify Email
            </a>
        </p>
    """
    
    message = MessageSchema(
        subject="Verify Your Email",
        recipients=[email],
        body=html,
        subtype="html"
    )
    
    fm = FastMail(config)
    await fm.send_message(message)
