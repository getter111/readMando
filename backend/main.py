from typing import Optional
from fastapi import FastAPI, HTTPException, Cookie, Response, Body
from fastapi.middleware.cors import CORSMiddleware
from uuid import uuid4
from datetime import datetime, timedelta, timezone
from pydantic import ValidationError
import jieba
import json
from typing import List
from jwt import ExpiredSignatureError, InvalidTokenError
import base64

import models
from supaDB import supabase, user_crud, vocabulary_crud, story_crud, question_crud, user_vocabulary_crud, user_stories_crud, progress_crud
from storyGenerator import generateStory
from email_utils import send_verification_email
from utils import text_to_audio, add_vocabulary_to_db, auto_fetch, generateQuestions
from supaDB import upload_audio_to_storage, save_audio_url_to_db
from fastapi.responses import RedirectResponse, StreamingResponse
from io import BytesIO
from gtts import gTTS
from auth import create_token, decode_token

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "https://localhost:5173", "https://readmando.netlify.app"], 
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
@app.get("/")
def read_root():
    return {"message": "Hello from FastAPI on Fly.io!"}

@app.post("/stories")
async def generate_story(
    request: models.StoryGenerationRequest,
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
            content=story["story"],
            voice=request.voice, 
            topic=request.topic,  
            vocabulary=request.vocabulary  
        )

        created_story = story_crud.create_story(save_story)
        story_id = created_story["story_id"]
        
        # If verified, save to user_stories bridge table
        if request.user.user_id != "Guest" and request.user.is_verified: 
                user_story = models.UserStoryCreate(
                    user_id=request.user.user_id,
                    story_id= story_id,
                    read_status="FALSE"
                )
                # Add the story to the user_stories table
                user_stories_crud.create_user_story(user_story)
        
        # use edge-tts to generate tts for the title and story, saves a local .wav file
        title_audio_path = await text_to_audio(story["title"], story_id, "title", request.voice) #add voice param
        story_audio_path = await text_to_audio(story["story"], story_id, "story", request.voice)

        # Upload audio files to supabase storage and get URLs, deletes local .wav file
        title_audio_url = await upload_audio_to_storage(title_audio_path)
        story_audio_url = await upload_audio_to_storage(story_audio_path)

        #save urls to stories table
        await save_audio_url_to_db(story_id, "title", title_audio_url)
        await save_audio_url_to_db(story_id, "story", story_audio_url)

        print(f"[generate_story] Request: difficulty={request.difficulty}, topic={request.topic}, vocab={request.vocabulary}\n")
        print(f"[generate_story] Generated story ID: {story_id}\n")

        return models.StoryGenerationResponse(
            story_id=story_id,
            title=story["title"],
            content=story["story"],
            title_audio=title_audio_url,
            story_audio=story_audio_url,
        )
        
    except Exception as e:
        print(str(e))
        raise HTTPException(status_code=500, detail=f"Error generating story")

# Endpoint to hydrate the story page
@app.get("/users/{user_id}/stories/latest", response_model= models.StoryPageHydration)
async def get_user_story_page_data(user_id: int):
    user = user_crud.get_user(user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    try:
        # get most recent story id to fetch story content, title, difficuly, audios, and questions
        most_recent_story_record = user_stories_crud.get_user_story(user_id)
        if not most_recent_story_record or "story_id" not in most_recent_story_record:
            raise HTTPException(status_code=404, detail="User has no previously generated stories")

        most_recent_story_id = most_recent_story_record["story_id"]
        story_data = story_crud.get_story_by_id(most_recent_story_id)
        questions = question_crud.get_questions_by_story_id(most_recent_story_id)

        res = models.StoryPageHydration(
            story_id=most_recent_story_id,
            content=story_data["content"],
            title=story_data["title"],
            difficulty=story_data["difficulty"],
            title_audio=story_data["title_audio"],
            story_audio=story_data["story_audio"],
            questions=questions,
            voice=story_data["voice"],
            vocabulary=story_data["vocabulary"],
            topic=story_data["topic"]
        )   

        print(f"[get_user_story_page_data] Successfully hydrated story page for story_id: {res.story_id}")       
        return res
    except Exception as e:
        print(e)
        raise HTTPException(status_code=500, detail=f"Internal Server Error")

@app.post("/stories/segment") #had to add a pydantic model/dict because in react passing json to body not a string. prev was (content:str) casuing 422 error
async def segment_story(request: models.StorySegmentationRequest):
    try:
        #jieba precise mode to segment story into most natural words
        words = list(jieba.cut(request.content, cut_all=False))
        return {"segmented_words": words}
    except Exception as e:
        print(str(e))
        raise HTTPException(status_code=500, detail=f"Error segmenting story")

# Generates a list of comprehention questions
@app.post("/stories/questions", response_model=List[models.QuestionCreate])
async def generate_questions(request: models.QuestionGenerationRequest):
    try:
        existing_questions = question_crud.get_questions_by_story_id(request.story_id)

        #return existing questions if they already exist
        if existing_questions:
            return existing_questions

        saved_questions = []

        #generate reading comprehension questions
        response = generateQuestions(request.story, request.difficulty, request.title)
        questions = json.loads(response) #parse json string 

        #insert generated questions to questions table
        for q in questions:
            new_question = models.QuestionCreate(
                story_id=request.story_id,
                question_text=q["question_text"],
                correct_answer=q["correct_answer"],
                answer_choices=q["answer_choices"]
            )
            saved_questions.append(new_question)
        
        batch = question_crud.create_questions_batch(saved_questions)

        print(f"[generate_questions] Generating questions for story_id={request.story_id}")
        print(f"[generate_questions] Questions generated: {questions}")

        return batch
    except Exception as e:
        print(str(e))
        raise HTTPException(status_code=500, detail=f"Question generation failed")

# endpoint to validate user session token
@app.get("/me")
async def get_current_user(response: Response, readmando_session: Optional[str] = Cookie(None)):
    if not readmando_session:
        raise HTTPException(status_code=401, detail="Missing session cookie")
    
    try:
        payload = decode_token(readmando_session)
        user = user_crud.get_user(payload["user_id"])
        if not user:
            raise HTTPException(status_code=404, detail="User not found")

        #refresh token if time < 10 mins
        exp_time = datetime.fromtimestamp(payload["exp"], tz=timezone.utc)
        now = datetime.now(timezone.utc)
        
        if (exp_time - now).total_seconds() < 60 * 10: 
            new_token = create_token(user["user_id"])
            response.set_cookie(
                key="readmando_session",
                value=new_token,
                httponly=True,
                secure=True,
                samesite="None",
                max_age=604800,
                path="/"
            )
            print(f"[get_current_user] Decoded token payload: {payload}")
            print(f"[get_current_user] Refreshed token exp: {decode_token(new_token)['exp']}")
        return user
    except ExpiredSignatureError as e:
        print(e)
        raise HTTPException(status_code=401, detail="Token expired")
    except InvalidTokenError as e:
        print(e)
        raise HTTPException(status_code=401, detail="Invalid token")
    except Exception as e:
        print(e)

# endpoint to retrieve user's study deck (all their saved words)
@app.get("/users/study_deck")
async def get_user_study_deck(readmando_session: Optional[str] = Cookie(None)):
    if not readmando_session:
        raise HTTPException(status_code=401, detail="Missing session cookie, please login")
    
    try: 
        payload = decode_token(readmando_session)
        user_id = payload["user_id"]
        vocab_ids = user_vocabulary_crud.get_user_vocabulary(user_id)  # Get all vocabulary for the user. returned in [VocabularyResponse]
        print(f"Got user {user_id}'s vocab deck")
        return vocab_ids
    except HTTPException:
        # re-raise HTTP exceptions to preserve status codes
        raise
    except Exception as e:
        print(e)
        raise HTTPException(status_code=400, detail="Something went wrong while retrieving user's study deck")

#endpoint to add vocabulary to user's study deck
@app.post("/users/study_deck")
async def add_vocabulary_to_study_deck(request: models.UserVocabularyRequest, readmando_session: Optional[str] = Cookie(None)):
    if not readmando_session:
        raise HTTPException(status_code=401, detail="Missing session cookie, please login")

    try:
        payload = decode_token(readmando_session)
        user_id = payload["user_id"]
        user = user_crud.get_user(user_id)

        if user and user != "Guest":
            vocab = vocabulary_crud.get_vocabulary_by_word(request.word)
            if vocab:
                # Check for duplicate in user's study deck
                existing = user_vocabulary_crud.get_user_vocabulary_by_user_and_word(user_id, request.word)
                if existing:
                    raise HTTPException(status_code=409, detail="Word is already in study deck")
                
                study_set_word = models.UserVocabularyCreate(
                    user_id=user_id,
                    vocab_id=vocab["vocab_id"],
                )

                res = user_vocabulary_crud.create_user_vocabulary(study_set_word)
                print(f"[add_vocabulary_to_study_set] Added word to study set for user_id: {user_id}")
                return res   
    except HTTPException:
        # re-raise HTTP exceptions to preserve status codes
        raise             
    except Exception as e:
        print(e)
        raise HTTPException(status_code=400, detail="Something went wrong while adding vocabulary to study set")

#endpoint to update status to active/inactive (soft delete)
@app.put("/study_deck/toggle")
async def toggle_vocabulary(request: dict = Body(...)):
    record = supabase.table("user_vocabulary").select("*").eq("user_vocab_id", request["user_vocab_id"]).execute()
    
    existing = record.data[0] if record.data else None

    if existing:
        new_status = not existing["is_active"]
        updated = supabase.table("user_vocabulary").update({"is_active": new_status}).eq("user_vocab_id", request["user_vocab_id"]).execute()
        return updated.data[0]

@app.get("/study_deck/tts") #query param
async def text_to_speech(word: str):
    BUCKET_NAME = "tts-cache"

    # Base64 encode the word since supabase storage can't storage chinese characters
    encoded_word = base64.urlsafe_b64encode(word.encode("utf-8")).decode("ascii")
    filename = f"{encoded_word}.mp3"

    try: 
        #filter file by exact filename instead of listing all files
        existing = supabase.storage.from_(BUCKET_NAME).list("", options={"search":filename})

        if existing and any(file["name"] == filename for file in existing):
            file_url = supabase.storage.from_(BUCKET_NAME).get_public_url(filename)
            print("existing tts found for", word)
            return {"url": file_url}
        else:
            tts = gTTS(text=word, lang="zh-CN")
            audio_bytes = BytesIO()
            tts.write_to_fp(audio_bytes)
            audio_bytes.seek(0)

            supabase.storage.from_(BUCKET_NAME).upload(
                filename, 
                audio_bytes.getvalue(),
                {"content-type": "audio/mpeg"}
            )
            print("generated new tts for", word)
            file_url = supabase.storage.from_(BUCKET_NAME).get_public_url(filename)
            return {"url": file_url}
    except Exception as e:
        print("TTS error:", e)
        raise HTTPException(status_code=500, detail="Failed to generate audio")

#get the state of all user_vocabulary words (optionally filter by status)
@app.get("/study_deck/status") #query param
async def filter_status(status_filter: Optional[str] = None, readmando_session: Optional[str] = Cookie(None)):
    if not readmando_session:
        raise HTTPException(status_code=401, detail="Not logged in")
    
    payload = decode_token(readmando_session)
    user_id = payload["user_id"]
    
    #for the filter tabs
    if status_filter:
        res = user_vocabulary_crud.get_user_vocabulary_status(user_id, status_filter)
        return res
    else: #initial load
        return {
            "memorized": user_vocabulary_crud.get_user_vocabulary_status(user_id, "memorized"),
            "not_memorized": user_vocabulary_crud.get_user_vocabulary_status(user_id, "not memorized"),
            "all": user_vocabulary_crud.get_user_vocabulary_status(user_id)
        }

#endpoint that updates user_vocabulary table for the flashcard study phase when word is marked as again, good, or easy
@app.put("/study_deck/update")
async def flashcard_vocabulary_update(
    request: dict, #payload [user_vocab_id: int, feedback: str]
    readmando_session: Optional[str] = Cookie(None),
):
    if not readmando_session:
        raise HTTPException(status_code=401, detail="Not logged in")
    try:
        payload = decode_token(readmando_session)
        user_id = payload["user_id"]

        user_vocab_id = request.get("user_vocab_id")
        feedback = request.get("feedback", "again")

        existing = user_vocabulary_crud.get_user_vocabulary_by_id(user_vocab_id)
        if not existing:
            raise HTTPException(status_code=404, detail="Vocabulary record not found")

        now = datetime.now(timezone.utc)
        interval = existing.get("interval", 1)
        repetitions = existing.get("repetitions", 0)
        ease_factor = existing.get("ease_factor", 2.5)

        updates = {
            "last_reviewed": now.isoformat(),
        }

        if feedback == "again":
            updates["status"] = "not memorized"
            updates["incorrect"] = (existing.get("incorrect", 0) or 0) + 1
            updates["repetitions"] = 0
            updates["interval"] = 1
            updates["ease_factor"] = max(1.3, ease_factor - 0.2)
        elif feedback == "good":
            updates["status"] = "memorized"
            updates["correct"] = (existing.get("correct", 0) or 0) + 1
            repetitions += 1
            interval = 3 if repetitions == 1 else round(interval * ease_factor)
            updates["repetitions"] = repetitions
            updates["interval"] = interval
            updates["ease_factor"] = ease_factor
        elif feedback == "easy":
            updates["status"] = "memorized"
            updates["correct"] = (existing.get("correct", 0) or 0) + 1
            repetitions += 1
            interval = 5 if repetitions == 1 else round(interval * (ease_factor + 0.15))
            ease_factor += 0.1
            updates["repetitions"] = repetitions
            updates["interval"] = interval
            updates["ease_factor"] = ease_factor

        updates["next_review"] = (now + timedelta(days=updates["interval"])).isoformat()
        
        #required fields for UserVocabularyUpdate model 
        updates["vocab_id"] = existing["vocab_id"]
        updates["user_id"] = user_id     

        update_model = models.UserVocabularyUpdate(**updates)
        updated = user_vocabulary_crud.update_user_vocabulary(user_vocab_id, update_model)
        return updated
    except Exception as e:
        print(e)
        raise HTTPException(status_code=400, detail="Something went wrong")

@app.post("/login")
async def login_user(user: models.UserCreate, response: Response): #response refers to the http response
    try:
        #Check if user exists
        existing_user = user_crud.get_user_by_name(user.username.lower())
        if not existing_user:
            raise HTTPException(status_code=404, detail="User does not exist or may not be verified.")

        if existing_user["is_verified"]:
            token = create_token(existing_user["user_id"])

            #set session cookie
            response.set_cookie(
                key="readmando_session",
                value=token,
                httponly=True,
                secure=True, #true == https, false == http
                samesite="None", #none means it allows sending cookies btwn backend&frontend
                max_age=604800,
                path="/"
            )
            
            updates = models.UserUpdate(
                session_token= token,
                last_login= datetime.now(),
                verification_token= None,  
            )
            
            print(f"[login_user] Attempting login for username: {user.username}")
            print(f"[login_user] User found: {existing_user}")
            print(f"[login_user] Generated cookie for user_id {existing_user['user_id']}")

            #save the session token and last login time
            new_user = user_crud.update_user(existing_user["user_id"], updates)
            return new_user
        else:
            raise HTTPException(status_code=403, detail="User not verified. Please check your email.")
    except Exception as e:
        print(str(e))
        raise HTTPException(status_code=500, detail="An internal error occurred")

@app.post("/logout")
def logout(response: Response):
    response.delete_cookie(
        key="readmando_session",
        path="/",
        secure=True, #true == https, false == http
        httponly=True, #hide cookies from javascript
        samesite="None" #none means it allows sending cookies btwn backend&frontend
    )
    print("User logged out")
    return {"username": "Guest"}

@app.post("/register")
async def register_user(user: models.UserCreate):
    try:
        # Check if user already exists
        existing_user = user_crud.get_user_by_name(user.username.lower())
        if existing_user:
            raise HTTPException(status_code=400, detail="Username already registered")
        
        # Generate verification token
        verification_token = str(uuid4())

        # Save new user status
        created_user = user_crud.create_user(
            models.UserCreate(
                username=user.username.lower(),
                email=user.email.lower(),
                verification_token=verification_token
            )
        )
        print(f"[register_user] Registering user: {user.username}, email: {user.email}")
        print(f"[register_user] Verification token generated: {verification_token}")

        # Send verification email
        await send_verification_email(user.username, user.email, verification_token)
        return {"message": "User registered successfully. Please check your email to verify your account."}
    except Exception as e:
        print(str(e))
        raise HTTPException(status_code=500, detail="An internal error occurred")

# endpoint to verify user's token
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
        
        return RedirectResponse(url="https://readmando.netlify.app/verification-success")
        # Now we just need to check if users attribute: is_verified, before saving to the db
    except Exception as e:
        print(str(e))
        raise HTTPException(status_code=500, detail="An internal error occurred")
    
#autofetch unknown words and add to db, should only be used on chinese characters
@app.post("/vocabulary")
async def add_vocabulary(request: models.VocabRequest):
    try:
        res = auto_fetch(request.vocab)
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

        print(f"[add_vocabulary] Incoming vocab: {request.vocab}")
        print(f"[add_vocabulary] Auto fetch result: {unknown_word}")

        #upserts the unknown word
        add_vocabulary_to_db([new_vocab.model_dump()])
        return new_vocab
    
    except Exception as e:
        print(e)
        raise HTTPException(status_code=500, detail=f"Auto-fetch failed for {request.vocab}: {str(e)}")
        
# endpoints to retrieve vocabulary for onhover effect
@app.get("/vocabulary/{word}")
async def get_vocabulary(word: str):
    vocab = vocabulary_crud.get_vocabulary_by_word(word)
    if vocab:
        return vocab
    else:
        raise HTTPException(status_code=404, detail="Vocabulary not found.")
    

# endpoint to save user's progress after completing reading comprehension questions
@app.post("/save_progress")
async def save_user_progress(progress: models.ProgressCreate):
    try:
        user = user_crud.get_user(progress.user_id)
        if not user:
            raise HTTPException(status_code=404, detail="User not found")

        saved_progress = progress_crud.upsert_progress(progress)
        user_stories_crud.update_user_story(
            models.UserStoryUpdate(
                read_status=True,  # Mark story as read
                story_id=progress.story_id,
                user_id=progress.user_id
            )
        )
        print(f"[save_user_progress] Saving progress for user_id={progress.user_id}, story_id={progress.story_id}")
        print(f"[save_user_progress] Progress saved: {saved_progress}")

        return saved_progress
    except Exception as e:
        print(str(e))
        raise HTTPException(status_code=500, detail=f"Error saving progress")
