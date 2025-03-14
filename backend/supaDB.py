import os
from dotenv import load_dotenv
from supabase import create_client, Client
from pydantic import ValidationError
import models
import aiofiles

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

#supabase storage bucket name
BUCKET_NAME = "audio"

##need to test
async def upload_audio_to_storage(id: int, type: str) -> str:

    folder = "titles" if type == "title" else "stories"

    audio_file_path = f'audio_files/{folder}/{type}_{id}_audio.wav'

    if not os.path.exists(audio_file_path):
        raise FileNotFoundError(f"Audio file {audio_file_path} not found.")

    async with aiofiles.open(audio_file_path, "rb") as file:
        file_content = await file.read()
    file_upload = supabase.storage.from_(BUCKET_NAME).upload(f'audio_files/{folder}/{type}_{id}_audio.wav', file_content)
    print(file_upload)
    public_url = supabase.storage.from_('audio').get_public_url(f'audio_files/{folder}/{type}_{id}_audio.wav')

    return public_url   

# async def save_audio_url_to_db(story_id: int, type: str, url: str):
#     column_name = "story_audio" if type == "story" else "title_audio"

#     response = supabase.table("stories").update({column_name: url}).eq("id", story_id).execute()

#     if "error" in response:
#         raise Exception(f"Error saving audio URL: {response['error']['message']}")

#     return response

# import asyncio
# async def main():

#     something = await upload_audio_to_storage(1, "title") 
#     print(something)
# asyncio.run(main())  