from dotenv import load_dotenv
import os
import jwt
from datetime import datetime, timedelta, timezone

load_dotenv()


SECRET_KEY=os.getenv("SECRET_KEY")
ALGORITHM=os.getenv("ALGORITHM")

def create_token(user_id: str):

    payload = {
        "user_id": user_id,
        "exp": datetime.now(timezone.utc) + timedelta(days=7) 
    }
    token = jwt.encode(payload, SECRET_KEY, algorithm=ALGORITHM)
    return token

def decode_token(token: str):
    return jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])