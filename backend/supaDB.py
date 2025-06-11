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
from crud.progress import ProgressCRUD 

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
progress_crud = ProgressCRUD(supabase)
user_vocabulary_crud = UserVocabularyCRUD(supabase)
user_stories_crud = UserStoryCRUD(supabase)
story_vocabulary_crud = StoryVocabularyCRUD(supabase) #TBA if used in future

#supabase storage bucket name
BUCKET_NAME = "audio"

async def upload_audio_to_storage(audio_file_path: str) -> str:
    try: 
        if not os.path.exists(audio_file_path):
            raise FileNotFoundError(f"Audio file {audio_file_path} not found.")

        async with aiofiles.open(audio_file_path, "rb") as file:
            file_content = await file.read()

        try:
            file_upload = supabase.storage.from_(BUCKET_NAME).upload(audio_file_path, file_content)
            print("upload_audio_to_storage: ", file_upload) #error was because i was trying to print file_upload + str
        except Exception as e:
            raise Exception(f"Error uploading file: {str(e)}")
        
        try:
            public_url = supabase.storage.from_(BUCKET_NAME).get_public_url(audio_file_path)
        except Exception as e:
            raise Exception(f"Error generating public URL: {str(e)}")
        
        #delete local audio file after upload and getting public url from supabase
        try:
            os.remove(audio_file_path)
            print(f"deleted local file: {audio_file_path}")
        except Exception as e:
            print(f"failed to delete local file {audio_file_path}: {str(e)}")

        return public_url   
    
    except Exception as e:
        print(f"upload_audio_to_storage failed: {str(e)}")
        return ""

async def save_audio_url_to_db(id: int, type: str, url: str):
    try: 
        column_name = "story_audio" if type == "story" else "title_audio"
        response = supabase.table("stories").update({column_name: url}).eq("story_id", id).execute()

        if "error" in response:
            raise Exception(f"Error saving audio URL: {response['error']['message']}")
        print("audio saved to stories table successfully")
        return response 
    except Exception as e:
        print(f"save_audio_url_to_db failed: {str(e)}")
        return None
    