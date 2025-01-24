# complete short story generator website
# generating a ebook should be extra feature

#build out back end api and front end reactjs
from typing import Union
from fastapi import FastAPI, HTTPException
from storyGenerator import generateStory
import models
from pydantic import ValidationError
from supaDB import user_crud, vocabulary_crud, story_crud, question_crud,user_vocabulary_crud, user_stories_crud, story_vocabulary_crud


app = FastAPI()

# @app.get("/")
# def read_root():
#     return {"Hello": "World"}


# @app.get("/items/{item_id}")
# def read_item(item_id: int, q: Union[str, None] = None):
#     return {"item_id": item_id, "q": q}

@app.post("/generate_story")
async def generate_story(request: models.StoryRequest, response_model=models.StoryResponse):
    try:
        story = generateStory(
            difficulty=request.difficulty,
            vocabulary=request.vocabulary,
            topic=request.topic
        )

        save_story = models.StoryCreate(title=story["title"], difficulty=request.difficulty, content=story["story"])
        story_crud.create_story(save_story)
        
        return models.StoryResponse(
            title=story["title"],
            story=story["story"]
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error generating story: {str(e)}")
