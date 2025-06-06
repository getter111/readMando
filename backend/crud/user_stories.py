# CRUD for user_stories table
from supabase import Client
from models import UserStoryCreate, UserStoryUpdate, StoryResponse, UserStoryResponse
from typing import List

class UserStoryCRUD:
    def __init__(self, supabase: Client):
        self.supabase = supabase

    def create_user_story(self, user_story: UserStoryCreate):
        insert_data = {
            "user_id": user_story.user_id,
            "story_id": user_story.story_id,
            "read_status": user_story.read_status,
        }
        res = self.supabase.table("user_stories").insert(insert_data).execute()
        return res.data[0] if res.data else None

    def get_user_stories(self, user_id: int) -> List[StoryResponse]:
        res = self.supabase.table("user_stories").select("*").eq("user_id", user_id).execute() #filter on user_id
        
        story_ids = [record["story_id"] for record in res.data] #collect keys
        #print(story_ids)

        story_res = self.supabase.table("stories").select("*").in_("story_id", story_ids).execute() #query stories table using the keys
        #print(story_res)
        storyList = []
        for record in story_res.data:
            res = StoryResponse(**record)
            storyList.append(res)
        return storyList

    # Gets most recent user storyid
    def get_user_story(self, user_id: int)  -> UserStoryResponse:
        res = self.supabase.table("user_stories").select("*").eq("user_id", user_id).order("created_at", desc=True).limit(1).execute()
        return res.data[0] if res.data else None

    def update_user_story(self, updates: UserStoryUpdate):
        update_data = updates.model_dump(exclude_unset=True, exclude_defaults=True)
        res = self.supabase.table("user_stories").update(update_data).eq("story_id", updates.story_id).execute()
        return res.data[0] if res.data else None

    def delete_user_story(self, user_story_id: int):
        res = self.supabase.table("user_stories").delete().eq("user_story_id", user_story_id).execute()
        return res.data[0] if res.data else None

