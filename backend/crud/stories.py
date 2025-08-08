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
             "content": story.content,
             "voice": story.voice,
             "topic": story.topic,
             "vocabulary": story.vocabulary
            }
        ).execute()
        return res.data[0]

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
    
    def get_all_stories(self, skip=0, limit=20): #gets username by passing in story_id -> user_stories to get user_id then go into users to get the username for that user_id
        res = self.supabase.table("stories").select("*, user_stories(user_id, users(username))").order("upvotes", desc=False).range(skip, skip + limit - 1).execute()
        return res.data

    def update_story_by_id(self, story_id: int, updates: StoryUpdate):
        update_data = updates.model_dump(exclude_unset=True, exclude_defaults=True)
        res = self.supabase.table("stories").update(update_data).eq("story_id", story_id).execute()
        return res.data[0]

    def update_story_by_title(self, title: str, updates: StoryUpdate):
        update_data = updates.model_dump(exclude_unset=True, exclude_defaults=True)
        res = self.supabase.table("stories").update(update_data).eq("title", title).execute()
        return res.data[0]

    def update_story_upvotes(self, story_id: int):
        current = self.supabase.table("stories").select("upvotes").eq("story_id", story_id).execute()
        if not current.data:
            return {"error": "Story not found"}

        new_upvotes = (current.data[0]["upvotes"] or 0) + 1

        res = self.supabase.table("stories").update({"upvotes": new_upvotes}).eq("story_id", story_id).execute()
        return res.data[0] if res.data else {"error": "Update failed"}

    def delete_story(self, story_id: int):
        res = self.supabase.table("stories").delete().eq("story_id", story_id).execute()
        return res.data[0]