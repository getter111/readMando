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
            "status": user_vocab.status,
            "correct": user_vocab.correct,
            "incorrect": user_vocab.incorrect,
            "last_reviewed": user_vocab.last_reviewed.isoformat() if user_vocab.last_reviewed else None,
            "next_review": user_vocab.next_review.isoformat() if user_vocab.next_review else None,
            "ease_factor": user_vocab.ease_factor,
            "interval": user_vocab.interval,
            "repetitions": user_vocab.repetitions,
        }
        res = self.supabase.table("user_vocabulary").insert(insert_data).execute()
        return res.data[0]
    
    def get_user_vocabulary(self, user_id: int) -> List[VocabularyResponse]:
        res = self.supabase.table("user_vocabulary").select("*").eq("user_id", user_id).execute() #filter on user_id
        
        vocab_ids = [record["vocab_id"] for record in res.data] #collect keys
        #print(vocab_ids)

        vocab_res = self.supabase.table("vocabulary").select("*").in_("vocab_id", vocab_ids).execute() #query vocab table using the keys
        #print(vocab_res)
        vocabList = []
        for record in vocab_res.data:
            res = VocabularyResponse(**record) #create model instance of VocabularyResponse, ** unpacks dictionary keys and values and passes them as arguments
            vocabList.append(res)
        return vocabList
    
    def update_user_vocabulary(self, user_vocab_id: int, updates: UserVocabularyUpdate):
        update_data = updates.model_dump(
            exclude_unset=True      
        )
        # Convert datetime fields if present
        if "last_reviewed" in update_data:
            update_data["last_reviewed"] = update_data["last_reviewed"].isoformat()
        if "next_review" in update_data:
            update_data["next_review"] = update_data["next_review"].isoformat()

        res = self.supabase.table("user_vocabulary").update(update_data).eq("user_vocab_id", user_vocab_id).execute()
        return res.data[0]
    
    def delete_user_vocabulary(self, user_vocab_id: int):
        res = self.supabase.table("user_vocabulary").delete().eq("user_vocab_id", user_vocab_id).execute()
        return res.data[0]
