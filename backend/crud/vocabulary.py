# CRUD for vocabulary table
from supabase import Client
from models import VocabularyCreate 

class VocabularyCRUD:
    def __init__(self, supabase: Client):
        self.supabase = supabase

    def create_vocabulary(self, vocabulary: VocabularyCreate):
        """
        Create a new vocabulary entry in the database.

        This function checks for duplicate entries before creating a new vocabulary item.
        If a duplicate is found, it returns an error message. Otherwise, it inserts the
        new vocabulary into the database.
        """
        isDuplicate = self.supabase.table("vocabulary").select("*").eq("word", vocabulary.word).eq("pinyin",vocabulary.pinyin).eq("translation", vocabulary.translation).execute()
        if isDuplicate.data:
            return {"error": "Word already exists in the vocabulary."}

        res = self.supabase.table("vocabulary").insert(
            {"word": vocabulary.word, 
             "pinyin": vocabulary.pinyin, 
             "translation": vocabulary.translation, 
             "audio_file": vocabulary.audio_file,
             "word_type": vocabulary.word_type,
             "example_sentence": vocabulary.example_sentence
             }
        ).execute()
        if res.data:  
            return res.data[0]  
        return None

    def get_vocabulary(self, vocab_id: int):
        res = self.supabase.table("vocabulary").select("*").eq("vocab_id", vocab_id).execute()
        if res.data:  
            return res.data[0]  
        return None  
    def get_vocabulary_by_word(self, word: str):
        res = self.supabase.table("vocabulary").select("*").eq("word", word).execute()
        if res.data:  
            return res.data[0]  
        return None  
    def get_vocabulary_by_translation(self, translation: str):
        res = self.supabase.table("vocabulary").select("*").eq("translation", translation).execute()
        return res.data[0]

    # def update_vocabulary(self, vocab_id: int, updates: UserUpdate):
    #     # Convert pydantic model to dictionary excluding unset fields
    #     update_data = updates.model_dump(exclude_unset=True, exclude_defaults=True)
    #     res = self.supabase.table("users").update(update_data).eq("vocab_id", vocab_id).execute()
    #     return res

    # def delete_vocabulary(self, vocab_id: int):
    #     res = self.supabase.table("vocabulary").update({"is_active": False}).eq("vocab_id", vocab_id).execute()
    #     return res