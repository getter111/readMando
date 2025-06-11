from pypinyin import lazy_pinyin, Style
from supaDB import vocabulary_crud
import requests
import os
from dotenv import load_dotenv
from fastapi import HTTPException
from openai import OpenAI
import json

load_dotenv()

client = OpenAI(
    api_key=os.environ.get("OPEN_API_KEY")
)

#return translation, pos, piyin, example sentence of unknown 子
def auto_fetch(word: str):
    outline_prompt = (
        "Give the English translation, part of speech such as noun, verb, adjective, "
        f"pinyin, and an simple Chinese example sentence for the Chinese word '{word}'. "
        "Respond ONLY in JSON format with the keys: \"word\", \"pinyin\", \"translation\", "
        "\"part of speech\", and \"example sentence\". Example:\n"
        "{\n"
        "  \"word\": \"苹果\",\n"
        "  \"pinyin\": \"píngguǒ\",\n"
        "  \"translation\": \"apple\",\n"
        "  \"part of speech\": \"noun\",\n"
        "  \"example sentence\": \"我喜欢吃苹果。\"\n"
        "}"
    )
    try:
        # pinyin = " ".join(lazy_pinyin(word, style=Style.TONE))

        request = client.chat.completions.create(
            model="gpt-4o-mini",
            messages=[
                {"role": "user", "content": outline_prompt}
            ]
        )

        fetched_word = request.choices[0].message.content.strip()
        return fetched_word
        
    except Exception as e:
        raise HTTPException(status_code=404, detail=f"Could not generate {word}: {str(e)}")
# print(auto_fetch("一"))

#inserts new row if not in table; updates row if already in table.
def add_vocabulary_to_db(vocab_list: list[dict]):
    try:
        res = vocabulary_crud.batch_insert_vocabulary(vocab_list) 
        print(f"Successfully added {len(res)} new words to the vocabulary table.")
    except Exception as e:
        print(f"Error adding vocabulary: {e}")

#call tts endpoint and write to our audio_path
def text_to_audio(text: str, id: int, type: str):
    folder = "titles" if type == "title" else "stories"
    audio_path = f'audio_files/{folder}/{type}_{id}_audio.wav'

    endpoint = os.environ.get("TTS_BASE_URL")

    try:
        response = requests.get(endpoint, params={
            "text": text,
            "id": id,
            "type": type
        })

        #create new audio file
        with open(audio_path, "wb") as f:
            f.write(response.content)

        return audio_path

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error calling melotts api: {str(e)}")
    
def generateQuestions(story:str, difficulty:str, title:str):
    prompt = (
        f"Create 5 multiple-choice reading comprehension questions in English for a Chinese language learner.\n\n"
        f"Use this format:\n"
        f"[\n"
        f"  {{\n"
        f"    \"question_text\": \"What ?\",\n"
        f"    \"correct_answer\": \"\",\n"
        f"    \"answer_choices\": [\"A\", \"B\", \"C\", \"D\"]\n"
        f"  }}\n"
        f"]\n\n"
        f"Level: {difficulty}\n"
        f"Title: {title}\n\n"
        f"Story:\n{story}\n\n"
        f"Respond with raw JSON only. No markdown, no explanation, no code block formatting."
        f"All answers and choices must be in English. Do not label the answer choices with letters."
    )

    try:
        request = client.chat.completions.create(
            model="gpt-4o-mini",
            messages=[
                {"role": "user", "content": prompt}
            ]
        )

        response = request.choices[0].message.content.strip()
        print(response)
        return response
        
    except Exception as e:
        raise HTTPException(status_code=404, detail=f"Could not generate comprehension questions {str(e)}")