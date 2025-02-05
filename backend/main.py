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

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

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
        
        # If email provided and verified, save to user_stories
        if user_email:
            user = user_crud.get_user_by_email(user_email)
            if user and user["is_verified"]:
                user_story = models.UserStoryCreate(
                    user_id=user["user_id"],
                    story_id=created_story.data[0]["story_id"], 
                    read_status="FALSE"
                )
                user_stories_crud.create_user_story(user_story)
        
        return models.StoryGenerationResponse( 
            title=story["title"],
            content=story["story"],
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
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    

    # TODO  Generate a list of comprehention questions at the end of the story
    # TODO  
