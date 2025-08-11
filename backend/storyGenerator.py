from dotenv import load_dotenv
from openai import OpenAI
import os

load_dotenv()

client = OpenAI(
    api_key=os.environ.get("OPENAI_API_KEY")
)

# Returns a short story
def generateStory(
    difficulty="beginner",
    vocabulary=None, 
    topic=None      
):
    audience = f"{difficulty.lower()} Chinese language students"

    title = generate_title(
        topic=topic,
        target_audience=audience
    )
    
    outline_prompt = (
        f'We are writing a short story in simplified Mandarin called "{title}". '
        + (f'It is about "{topic}". ' if topic else '') 
        + f'Our reader is: {audience}. '
        + (f'The story should include the following vocabulary: {", ".join(vocabulary)} while following the theme of the topic. ' if vocabulary else '')
        + 'Write a short story with a clear beginning, middle, and ending, to improve the readers reading comprehension in Mandarin. '
        + 'The output should be as helpful to the reader as possible. '
        + 'The story should be concise, around 300-400 characters long. '
        + 'Also please do not add the title of the story in the body of the text. Please adhere to it.'
    )

    #https://platform.openai.com/docs/api-reference/chat/create  
    request = client.chat.completions.create(
        model="gpt-4o-mini",
        messages=[ 
            {"role": "user", "content": outline_prompt}],
        #max_completion_token=
        temperature=1
    )
    generatedText = request.choices[0].message.content.strip()

    # print("\nCHATGPT RESPONSE\n")
    # print(outline_prompt)
    # print(f"Title: {title}")
    # print(generatedText)
    # return generatedText
    return {
        "title": title,
        "story": generatedText
    }


# Generate a title
def generate_title(
    topic=None,
    target_audience="beginner Chinese language students",
):
    title_prompt = (
        f'We are writing a short story in Mandarin. '
        + (f'It is about "{topic}". ' if topic else '')
        + f'Our readers are: "{target_audience}". Write a short, catchy ' 
        + "title clearly directed at our reader that is less than "
        + "9 words and grabs the reader's attention. "
        + "Also please do not add anything about the difficulty level in the title"
    )

    request = client.chat.completions.create(
        model="gpt-4o-mini",
        messages=[
            {"role": "user", "content": title_prompt}
        ],
        max_completion_tokens=14,
        temperature=1
    )
    title = request.choices[0].message.content.strip()
    title = title.replace('"', "")
    return title    