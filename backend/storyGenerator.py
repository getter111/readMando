from dotenv import load_dotenv
from services.llm_service import generate_completion
import os

load_dotenv()

# Returns a short story
def generateStory(
    difficulty="beginner",
    vocabulary=None, 
    topic=None,
    api_key=None,
    model=None,
    base_url=None
):
    audience = f"{difficulty.lower()} Chinese language students"

    title = generate_title(
        topic=topic,
        target_audience=audience,
        api_key=api_key,
        model=model,
        base_url=base_url
    )
    
    outline_prompt = (
        f'We are writing a short story in simplified Mandarin called "{title}". '
        + (f'It is about "{topic}". ' if topic else '') 
        + f'Our reader is: {audience}. '
        + (f'The story should include the following vocabulary: {", ".join(vocabulary)} while following the theme of the topic. ' if vocabulary else '')
        + 'Write a short story with a clear beginning, middle, and ending, to improve the readers reading comprehension in Mandarin. '
        + 'The output should be as helpful to the reader as possible. '
        + 'The story should be concise, around 300-400 characters long. '
        + 'Also please do not add the title of the story in the body of the text. '
        + 'CRITICAL REQUIREMENT: The story MUST be written ENTIRELY in Simplified Chinese characters (Hanzi). DO NOT output any English words, English translations, or Pinyin in the story text under any circumstances.'
    )

    messages = [{"role": "user", "content": outline_prompt}]
    generatedText = generate_completion(
        messages=messages,
        api_key=api_key,
        model=model,
        base_url=base_url,
        temperature=1
    )

    return {
        "title": title,
        "story": generatedText
    }


# Generate a title
def generate_title(
    topic=None,
    target_audience="beginner Chinese language students",
    api_key=None,
    model=None,
    base_url=None
):
    title_prompt = (
        f'We are writing a short story in Mandarin Chinese. '
        + (f'It is about "{topic}". ' if topic else '')
        + f'Our readers are: "{target_audience}". '
        + "Write a short, catchy story title in SIMPLIFIED CHINESE. "
        + "Rules: 1. Output ONLY the Chinese characters. 2. NO English. 3. NO conversational filler (e.g. 'Here are options'). 4. NO quotes. 5. Less than 10 characters."
    )

    messages = [
        {"role": "system", "content": "You are a helpful assistant that only outputs raw text in Simplified Chinese. Never provide options or explanations."},
        {"role": "user", "content": title_prompt}
    ]
    title = generate_completion(
        messages=messages,
        api_key=api_key,
        model=model,
        base_url=base_url,
        temperature=0.3, # Lower temperature for more consistent title output
        max_tokens=200
    )
    # Clean up any leftover punctuation or surrounding text
    title = title.split('\n')[0].strip().replace('"', '').replace('《', '').replace('》', '')
    return title    