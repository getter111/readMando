# CRUD for progress table
from supabase import Client
from models import ProgressCreate, ProgressResponse
from typing import List
class ProgressCRUD:
    def __init__(self, supabase: Client):
        self.supabase = supabase

    def upsert_progress(self, progress: ProgressCreate):
        res = self.supabase.table("progress").upsert(
            {
                "user_id": progress.user_id,
                "story_id": progress.story_id,
                "completion_status": progress.completion_status,
                "questions_correct": progress.questions_correct,
            },
            on_conflict=["story_id"]  
        ).execute()
        return res.data[0] if res.data else None
