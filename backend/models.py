#validation and serialization of data
from fastapi import FastAPI
from pydantic import BaseModel, EmailStr
from typing import Optional, List
from datetime import datetime

# Stories Table
class StoryBase(BaseModel):
    title: str
    difficulty: Optional[str] = None
    content: Optional[str] = None

class StoryCreate(StoryBase):
    pass

class StoryUpdate(StoryBase):
    pass

class StoryResponse(StoryBase):
    story_id: int
    created_at: datetime

# Users Table
class UserBase(BaseModel):
    username: str
    email: Emailstr
    verification_token: Optional[str] = None
    is_verified: Optional[bool] = False
    is_active: Optional[bool] = True

#used when creating a user
class UserCreate(UserBase):
    pass

#used when sending the response back to client
class UserResponse(UserBase):
    user_id: int
    created_at: datetime

#used for updating a user:
class UserUpdate(BaseModel):
    username: Optional[str] = None 
    email: Optional[str] = None
    verification_token: Optional[str] = None
    is_verified: Optional[bool] = None
    is_active: Optional[bool] = None

# Vocabulary Table
class VocabularyBase(BaseModel):
    word: str
    pinyin: Optional[str] = None
    translation: Optional[str] = None
    audio_file: Optional[str] = None

class VocabularyCreate(VocabularyBase):
    pass

class VocabularyResponse(VocabularyBase):
    vocab_id: int
    created_at: datetime

### I feel like Progress and Questions table can be combined. Maybe we do not need both###

# Progress Table
class ProgressBase(BaseModel):
    user_id: int
    story_id: int
    completion_status: Optional[float] #better name would probably be comprehension score
    questions_correct: Optional[int]

class ProgressCreate(ProgressBase): 
    pass

class ProgressResponse(ProgressBase):
    progress_id: int
    created_at: datetime

# Questions Table
class QuestionBase(BaseModel):
    story_id: Optional[int] = None
    question_text: str
    correct_answer: Optional[str] = None
    answer_choices: Optional[List[str]] = None

class QuestionCreate(QuestionBase):
    pass
class QuestionUpdate(QuestionBase):
    pass
class QuestionResponse(QuestionBase):
    question_id: int
    created_at: datetime



# UserVocabulary Table
class UserVocabularyBase(BaseModel):
    user_id: int
    vocab_id: int
    times_reviewed: Optional[int] = None
    mastery_level: Optional[float] = None

class UserVocabularyCreate(UserVocabularyBase):
    pass
class UserVocabularyUpdate(UserVocabularyBase):
    pass
class UserVocabularyResponse(UserVocabularyBase):
    user_vocab_id: int
    created_at: datetime

# UserStories Table
class UserStoryBase(BaseModel):
    user_id: int
    story_id: int
    read_status: Optional[bool] = None

class UserStoryCreate(UserStoryBase):
    pass
class UserStoryUpdate(UserStoryBase):
    pass
class UserStoryResponse(UserStoryBase):
    user_story_id: int
    created_at: datetime


# StoryVocabulary Table
class StoryVocabularyBase(BaseModel):
    story_id: int
    vocab_id: int

class StoryVocabularyCreate(StoryVocabularyBase):
    pass
class StoryVocabularyUpdate(StoryVocabularyBase):
    pass
class StoryVocabularyResponse(StoryVocabularyBase):
    story_vocab_id: int
    created_at: datetime

#story generation model
class StoryRequest(BaseModel):
    difficulty: Optional[str]
    vocabulary: Optional[List[str]] 
    topic: Optional[str]

class StoryResponse(BaseModel):
    title: str
    story: str