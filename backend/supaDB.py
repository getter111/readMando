#entry point to supabase database
import os
from dotenv import load_dotenv
from supabase import create_client, Client
from pydantic import ValidationError
import models

from crud.users import UsersCRUD
from crud.vocabulary import VocabularyCRUD
from crud.stories import StoryCRUD
from crud.questions import QuestionCRUD
from crud.user_vocabulary import UserVocabularyCRUD
from crud.user_stories import UserStoryCRUD
from crud.story_vocabulary import StoryVocabularyCRUD
load_dotenv()

url: str = os.environ.get("SUPABASE_URL")
key: str = os.environ.get("SUPABASE_API_KEY")
if not url or not key:
    raise ValueError("Supabase URL or API Key not found.")
supabase: Client = create_client(url, key)

#tables
user_crud = UsersCRUD(supabase)
vocabulary_crud = VocabularyCRUD(supabase)
story_crud = StoryCRUD(supabase)
question_crud = QuestionCRUD(supabase)
#todo: progress_crud

#bridge tables
user_vocabulary_crud = UserVocabularyCRUD(supabase)
user_stories_crud = UserStoryCRUD(supabase)
story_vocabulary_crud = StoryVocabularyCRUD(supabase) #TBA if used in future

#example of creating a QuestionBase object for inserting into table
#listQuestions = models.QuestionBase(story_id=1, question_text= "what the name of goo",correct_answer= "goo", answer_choices=["cum","goo","slime","milk"])
# storyVocab = models.StoryVocabularyBase(story_id=1, vocab_id=1)

# try:
#     result = story_vocabulary_crud.get_story_vocabulary(1)
#     print(result)
#     for r in result:
#         print(r)
# except ValidationError as e: 
#     print(f"KEKWWWW: {e}")