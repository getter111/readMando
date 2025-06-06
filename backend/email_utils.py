from fastapi_mail import FastMail, MessageSchema, ConnectionConfig
from typing import List
import os
from dotenv import load_dotenv

load_dotenv()

async def send_verification_email(username: str, email: str, verification_token: str):
    
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
    #os.environ.get
    BASE_URL = os.getenv("BASE_URL", "http://127.0.0.1:8000")

    # verify it is a real email account, calls backend endpoint
    html = f"""    
        <!DOCTYPE html>
        <html>
            <body>
                <div>
                    <h3>Welcome to ReadMando, {username}! 👋</h3>
                    <p>We're excited to help you on your Chinese learning journey.</p>
                    <p>To get started, please verify your email address by clicking the button below:</p>
                    <p>
                        <a href="{BASE_URL}/verify/{verification_token}">Verify Email</a>
                    </p>
                    <div>
                        If you did not sign up for ReadMando, you can safely ignore this email.
                    </div>
                </div>
            </body>
        </html>
    """
    
    message = MessageSchema(
        subject="Activate your ReadMando account",
        recipients=[email],
        body=html,
        subtype="html"
    )
    
    fm = FastMail(config)
    await fm.send_message(message)

