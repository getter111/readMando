# CRUD for user_vocabulary table
from supabase import Client
from models import UserVocabularyCreate, UserVocabularyUpdate, VocabularyResponse
from typing import List

class UserVocabularyCRUD:
    def __init__(self, supabase: Client):
        self.supabase = supabase

    def create_user_vocabulary(self, user_vocab: UserVocabularyCreate):
        insert_data = {
            "user_id": user_vocab.user_id,
            "vocab_id": user_vocab.vocab_id,
            "times_reviewed": user_vocab.times_reviewed,
            "mastery_level": user_vocab.mastery_level
        }
        res = self.supabase.table("user_vocabulary").insert(insert_data).execute()
        return res

    def get_user_vocabulary(self, user_id: int) -> List[VocabularyResponse]:
        res = self.supabase.table("user_vocabulary").select("*").eq("user_id", user_id).execute() #filter on user_id
        
        vocab_ids = [record["vocab_id"] for record in res.data] #collect keys
        #print(vocab_ids)

        vocab_res = self.supabase.table("vocabulary").select("*").in_("vocab_id", vocab_ids).execute() #query vocab table using the keys
        #print(vocab_res)
        vocabList = []
        for record in vocab_res.data:
            res = VocabularyResponse(**record)
            vocabList.append(res)
        return vocabList

    def update_user_vocabulary(self, user_vocab_id: int, updates: UserVocabularyUpdate):
        update_data = updates.model_dump(exclude_unset=True, exclude_defaults=True)
        res = self.supabase.table("user_vocabulary").update(update_data).eq("user_vocab_id", user_vocab_id).execute()
        return res

    def delete_user_vocabulary(self, user_vocab_id: int):
        res = self.supabase.table("user_vocabulary").delete().eq("user_vocab_id", user_vocab_id).execute()
        return res
