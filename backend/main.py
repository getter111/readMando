# complete short story generator website
# generating a ebook should be extra feature

#build out back end api and front end reactjs
from typing import Union
from fastapi import FastAPI, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from uuid import uuid4
from datetime import datetime, timedelta
from pydantic import ValidationError
import jieba
import json

import models
from supaDB import user_crud, vocabulary_crud, story_crud, question_crud,user_vocabulary_crud, user_stories_crud, story_vocabulary_crud
from storyGenerator import generateStory
from email_utils import send_verification_email
from utils import text_to_audio, add_vocabulary_to_db, auto_fetch
from supaDB import upload_audio_to_storage, save_audio_url_to_db

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "https://readmando.netlify.app", "https://melo-api.fly.dev"], 
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
        story_id = created_story["story_id"]
        
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

        # use melo api to generate tts for the title and story
        title_audio_path = text_to_audio(story["title"], story_id, "title")
        story_audio_path = text_to_audio(story["story"], story_id, "story")

        # Upload audio files to supabase storage and get URLs
        title_audio_url = await upload_audio_to_storage(title_audio_path)
        story_audio_url = await upload_audio_to_storage(story_audio_path)

        #save urls to stories table
        await save_audio_url_to_db(story_id, "title", title_audio_url)
        await save_audio_url_to_db(story_id, "story", story_audio_url)

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

#email_utils calls this endpoint to verify token
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
        # Now we just need to check if users attribute: is_verified, before saving to the db
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    
@app.post("/segment_story") #had to add a pydantic model/dict because in react passing json to body not a string. prev was (content:str) casuing 422 error
async def segment_story(request: models.StorySegmentationRequest):
    try:
        #jieba precise mode to segment story into most natural words
        words = list(jieba.cut(request.content, cut_all=False))
        return {"segmented_words": words}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error segmenting story: {str(e)}")

#autofetch unknown words and add to db
@app.post("/vocabulary/{word}")
async def add_vocabulary(vocab: str):
    try:
        res = auto_fetch(vocab)
        #Response body: "{\n  \"word\": \"诸葛亮\",\n  \"pinyin\": \"Zhūgě Liàng\",\n  \"translation\": \"Zhuge Liang\",\n  \"part of speech\": \"noun\",\n  \"example sentence\": \"诸葛亮是三国时期著名的谋略家。\"\n}"
        if isinstance(res, str):
            unknown_word = json.loads(res) #convert json string -> python dict
        elif isinstance(res, dict):
            unknown_word = res
        else:
            raise ValueError("Unexpected format from auto_fetch()")
        
        #obj representation of dict
        new_vocab = models.VocabularyCreate(
            word=unknown_word["word"],
            pinyin=unknown_word["pinyin"],
            translation=unknown_word["translation"],
            word_type=unknown_word["part of speech"],
            example_sentence=unknown_word["example sentence"]
        )
        print("res:str =")
        print(res)
        print("unknown_word:dict =")
        print(unknown_word)

        #upserts the unknown word
        add_vocabulary_to_db([new_vocab.model_dump()])
        return new_vocab
    
    except Exception as e:
        return HTTPException(status_code=500, detail=f"Auto-fetch failed for {vocab}: {str(e)}")
        
# endpoints to retrieve vocabulary for onhover effect
@app.get("/vocabulary/{word}")
async def get_vocabulary(word: str):
    vocab = vocabulary_crud.get_vocabulary_by_word(word)
    if vocab:
        return vocab
    else:
        raise HTTPException(status_code=404, detail="Vocabulary not found.")
    
# TODO  Generate a list of comprehention questions at the end of the story
