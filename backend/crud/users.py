# CRUD for users table
from supabase import Client
from models import UserUpdate, UserCreate

class UsersCRUD:
    def __init__(self, supabase: Client):
        self.supabase = supabase

    def create_user(self, user: UserCreate):
        res = self.supabase.table("users").insert(
            {"username": user.username, 
             "email": user.email, 
             "verification_token": user.verification_token,
             "is_verified": user.is_verified,
             "is_active": user.is_active,
            }
        ).execute()
        return res.data[0]

    def get_user(self, user_id: int):
        res = self.supabase.table("users").select("*").eq("user_id", user_id).execute()
        if res.data:  
            return res.data[0]  
        return None  
    
    def get_user_by_name(self, username: str):
        res = self.supabase.table("users").select("*").eq("username", username).execute()
        if res.data:  
            return res.data[0]  
        return None  

    def get_user_by_email(self, email: str):
        res = self.supabase.table("users").select("*").eq("email", email).execute()
        if res.data:  
            return res.data[0]  
        return None  

    def get_user_by_verification_token(self, token: str):
        res = self.supabase.table("users").select("*").eq("verification_token", token).execute()
        if res.data:  
            return res.data[0]  
        return None  

    def update_user(self, user_id: int, updates: UserUpdate):
        # Convert pydantic model to dictionary excluding unset fields
        update_data = updates.model_dump(exclude_unset=True, exclude_defaults=True)
        res = self.supabase.table("users").update(update_data).eq("user_id", user_id).execute()
        return res.data[0]

    def delete_user(self, user_id: int):
        res = self.supabase.table("users").update({"is_active": False}).eq("user_id", user_id).execute()
        return res.data[0]