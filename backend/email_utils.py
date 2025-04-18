from fastapi_mail import FastMail, MessageSchema, ConnectionConfig
from typing import List
import os
from dotenv import load_dotenv

load_dotenv()

async def send_verification_email(email: str, verification_token: str):
    
    print(f"Sending email to {email}")
    
    config = ConnectionConfig(
        MAIL_USERNAME = os.getenv("MAIL_USERNAME"),
        MAIL_PASSWORD = os.getenv("MAIL_PASSWORD"), 
        MAIL_FROM = os.getenv("MAIL_FROM"), 
        MAIL_PORT=587, 
        MAIL_SERVER = "smtp.gmail.com", 
        MAIL_SSL_TLS = False,
        MAIL_STARTTLS = True,
        USE_CREDENTIALS = True
    )

    BASE_URL = os.getenv("BASE_URL", "http://127.0.0.1:8000")

    html = f"""
        <p>Please verify your email by clicking the link below:</p>
        <p>
            <a href="{BASE_URL}/verify/{verification_token}">
                Verify Email
            </a>
        </p>
    """
    
    message = MessageSchema(
        subject="Read Mando: Verify Your Email",
        recipients=[email],
        body=html,
        subtype="html"
    )
    
    fm = FastMail(config)
    await fm.send_message(message)

