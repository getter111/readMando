# CRUD for stories table
from supabase import Client
from typing import List
from models import StoryResponse, StoryUpdate, StoryCreate

class StoryCRUD:
    def __init__(self, supabase: Client):
        self.supabase = supabase

    def create_story(self, story: StoryCreate):
        res = self.supabase.table("stories").insert(
            {"title": story.title, 
             "difficulty": story.difficulty, 
             "content": story.content}
        ).execute()
        return res

    def get_story_by_id(self, story_id: int):
        res = self.supabase.table("stories").select("*").eq("story_id", story_id).execute()
        if res.data:
            return res.data[0]  
        return {"error": "Story not found"}
    
    def get_story_by_title(self, title: str):
        res = self.supabase.table("stories").select("*").eq("title", title).execute()
        if res.data:
            return res.data[0]  
        return {"error": "Story not found"}

    def get_all_stories(self) -> List[StoryResponse]:
        res = self.supabase.table("stories").select("*").execute()
        return res.data if res.data else []

    def update_story_by_id(self, story_id: int, updates: StoryUpdate):
        update_data = updates.model_dump(exclude_unset=True, exclude_defaults=True)
        res = self.supabase.table("stories").update(update_data).eq("story_id", story_id).execute()
        return res

    def update_story_by_title(self, title: str, updates: StoryUpdate):
        update_data = updates.model_dump(exclude_unset=True, exclude_defaults=True)
        res = self.supabase.table("stories").update(update_data).eq("title", title).execute()
        return res

    def delete_story(self, story_id: int):
        res = self.supabase.table("stories").delete().eq("story_id", story_id).execute()
        return res