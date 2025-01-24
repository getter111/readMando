# CRUD for story_vocabulary table

from supabase import Client
from models import StoryVocabularyCreate, StoryVocabularyUpdate, VocabularyResponse
from typing import List

class StoryVocabularyCRUD:
    def __init__(self, supabase: Client):
        self.supabase = supabase

    def create_story_vocabulary(self, user_story: StoryVocabularyCreate):
        insert_data = {
            "story_id": user_story.story_id,
            "vocab_id": user_story.vocab_id,
        }
        res = self.supabase.table("story_vocabulary").insert(insert_data).execute()
        return res

    def get_story_vocabulary(self, story_id: int) -> List[VocabularyResponse]:
        res = self.supabase.table("story_vocabulary").select("*").eq("story_id", story_id).execute() #filter on story_id
        
        vocab_ids = [record["vocab_id"] for record in res.data] #collect keys
        #print(vocab_ids)

        vocab_res = self.supabase.table("vocabulary").select("*").in_("vocab_id", vocab_ids).execute() #query vocab table using the keys
        #print(vocab_res)
        vocabList = []
        for record in vocab_res.data:
            res = VocabularyResponse(**record)
            vocabList.append(res)
        return vocabList

    # def update_story_vocabulary(self, user_story_id: int, updates: StoryVocabularyUpdate):
    #     update_data = updates.model_dump(exclude_unset=True, exclude_defaults=True)
    #     res = self.supabase.table("story_vocabulary").update(update_data).eq("user_story_id", user_story_id).execute()
    #     return res

    # def delete_story_vocabulary(self, user_story_id: int):
    #     res = self.supabase.table("story_vocabulary").delete().eq("user_story_id", user_story_id).execute()
    #     return res
