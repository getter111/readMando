# complete short story generator website
# generating a ebook should be extra feature

#build out back end api and front end reactjs
from typing import Union
from fastapi import FastAPI, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from uuid import uuid4
from datetime import datetime, timedelta
from pydantic import ValidationError

import models
from supaDB import user_crud, vocabulary_crud, story_crud, question_crud,user_vocabulary_crud, user_stories_crud, story_vocabulary_crud
from storyGenerator import generateStory
from email_utils import send_verification_email
from utils import text_to_audio
from supaDB import upload_audio_to_storage, save_audio_url_to_db

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "https://dashing-pithivier-2c0a32.netlify.app"], 
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
@app.get("/")
def read_root():
    return {"message": "Hello from FastAPI on Fly.io!"}

@app.post("/generate_story")
async def generate_story(
    request: models.StoryGenerationRequest,
    user_email: str = None,
):
    try:
        story = generateStory(
            difficulty=request.difficulty,
            vocabulary=request.vocabulary,
            topic=request.topic
        )

        # Save story to stories table
        save_story = models.StoryCreate(
            title=story["title"], 
            difficulty=request.difficulty, 
            content=story["story"]
        )
        created_story = story_crud.create_story(save_story)
        story_id = created_story.data[0]["story_id"]
        
        # If email provided and verified, save to user_stories bridge table
        if user_email:
            user = user_crud.get_user_by_email(user_email)
            if user and user["is_verified"]:
                user_story = models.UserStoryCreate(
                    user_id=user["user_id"],
                    story_id= story_id,
                    read_status="FALSE"
                )
                user_stories_crud.create_user_story(user_story)
        


        """
        # extract any words from the generated story and title 
        title = extractVocab(story["title"])
        words = extractVocab(story["story"])
        """


##need to test
        # use melo api to generate tts for the title and story
        title_audio_path = text_to_audio(story["title"], story_id, type="title")
        story_audio_path = text_to_audio(story["story"], story_id, type="story")
        # Upload audio files and get URLs
        title_audio_url = upload_audio_to_storage(story_id, type="title")
        story_audio_url = upload_audio_to_storage(story_id, type="story")


        return models.StoryGenerationResponse(
            title=story["title"],
            content=story["story"]
        )
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error generating story: {str(e)}")

@app.post("/register")
async def register_user(user: models.UserCreate):
    try:
        # Check if user already exists
        existing_user = user_crud.get_user_by_name(user.username)
        if existing_user:
            raise HTTPException(status_code=400, detail="Username already registered")
        
        # Generate verification token
        verification_token = str(uuid4())

        # Save user with unverified status
        created_user = user_crud.create_user(
            models.UserCreate(
                username=user.username,
                email=user.email,
                verification_token=verification_token
            )
        )

        # Send verification email
        await send_verification_email(user.email, verification_token)
        
        return {"message": "Registration successful. Please check your email to verify your account."}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/verify/{token}")
async def verify_email(token: str):
    try:
        user = user_crud.get_user_by_verification_token(token)
        if not user:
            raise HTTPException(status_code=400, detail="Invalid verification token")
        
        updates = models.UserUpdate(
            is_verified=True,
            verification_token="NULL"  # Clear the token to prevent duplicates
        )
        user_crud.update_user(user["user_id"], updates)
        
        return {"message": "Email verified successfully. Your progress, will now be stored and ready for you the next time you log in!"}
        # Now we just need to check if user is verified before saving to the db
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    

    # TODO  Generate a list of comprehention questions at the end of the story
    # TODO  
@app.post("/generate-audio/")
async def generate_audio(text: str, story_id: int, type: str):
    # Generate the TTS audio file
    audio_path = text_to_audio(text, story_id, type)

    # Upload the file to Supabase Storage
    audio_url = await upload_audio_to_storage(story_id, type)

    # Save URL in Supabase Database
    await save_audio_url_to_db(story_id, type, audio_url)

    return {"message": "Audio processed successfully", "audio_url": audio_url}