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
user_vocabulary_crud = UserVocabularyCRUD(supabase)
user_stories_crud = UserStoryCRUD(supabase)
story_vocabulary_crud = StoryVocabularyCRUD(supabase) #TBA if used in future



##need to test
def upload_audio_to_storage(story_id: int, type: str) -> str:

    folder = "titles" if type == "title" else "stories"

    audio_file_path = f'audio_files/{folder}/{type}_{story_id}_audio.wav'

    if not os.path.exists(audio_file_path):
        raise FileNotFoundError(f"Audio file {audio_file_path} not found.")

    with open(audio_file_path, 'rb') as file:
        storage_response = supabase.storage.from_('audio').upload(f'{folder}/{type}_{story_id}_audio.wav', file)

    if storage_response.status_code != 200:
        raise Exception(f"Error uploading audio file: {storage_response.text}")
    
    public_url = supabase.storage.from_('audio').get_public_url(f'{folder}/{type}_{story_id}_audio.wav')['publicURL']
    return public_url   