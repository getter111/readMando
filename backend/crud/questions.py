# CRUD for questions table
from supabase import Client
from models import QuestionUpdate, QuestionCreate, QuestionResponse
from typing import List

class QuestionCRUD:
    def __init__(self, supabase: Client):
        self.supabase = supabase

    def create_question(self, question : QuestionCreate):
        res = self.supabase.table("questions").insert(
            {
                "story_id": question.story_id,
                "question_text": question.question_text,
                "correct_answer": question.correct_answer,
                "answer_choices": question.answer_choices,
            }
        ).execute()
        return res.data[0]
    
    def create_questions_batch(self, questions: List[QuestionCreate]):
        payload = [
            {
                "story_id": q.story_id,
                "question_text": q.question_text,
                "correct_answer": q.correct_answer,
                "answer_choices": q.answer_choices,
            }
            for q in questions
        ]
        
        res = self.supabase.table("questions").insert(payload).execute()
        print("Batch Insert: \n")
        print(res.data)
        return res.data
    
    def get_question_by_id(self, question_id: int):
        res = self.supabase.table("questions").select("*").eq("question_id", question_id).execute()
        if res.data:
            return res.data[0] 
        return {"error": "Question not found"}

    def get_questions_by_story_id(self, story_id: int) -> List[QuestionResponse]:
        res = self.supabase.table("questions").select("*").eq("story_id", story_id).execute()
        return res.res.data[0] if res.data else []

    def update_question(self, question_id: int, updates: QuestionUpdate):
        update_data = updates.model_dump(exclude_unset=True, exclude_defaults=True)
        res = self.supabase.table("questions").update(update_data).eq("question_id", question_id).execute()
        return res.data[0]

    def delete_question(self, question_id: int):
        res = self.supabase.table("questions").delete().eq("question_id", question_id).execute()
        return res.data[0]
