from pypinyin import pinyin, Style
# import some_translation_api  #open source machine translation api
from supaDB import vocabulary_crud
import requests
import os
from dotenv import load_dotenv

load_dotenv()

def extract_vocab(text: str):
    #extract unique vocab from text
    words = set(text)
    vocab_list = []

    for word in words:
        #TODO: research to see if there is free translation api (if not might have to use google translate)
        english_translation = some_translation_api.translate(word, target_lang="en")
        pinyin_rep = " ".join([syllable[0] for syllable in pinyin(word, style=Style.TONE3)])  # Convert to Pinyin with tones

        vocab_list.append({
            "word": word,
            "pinyin": pinyin_rep,
            "translation": english_translation
            #word_type = "trust the user to fill in this field, create a put endpoint"
            #example_sentence = "could use ai to fill in this field"
            #audio_file = "idk if it is wise to let user fill in this field, but also I don't want to voice 1000+ vocab words"
        })

    return vocab_list

#inserts new row if not in table.
#updates row if already in table.
def add_vocabulary_to_db(vocab_list: list[dict]):
    try:
        res = vocabulary_crud.batch_insert_vocabulary(vocab_list) 
        print(f"Successfully added {len(res)} new words to the vocabulary table.")
    except Exception as e:
        print(f"Error adding vocabulary: {e}")

#call melotts tts endpoint and write to our audio_path
def text_to_audio(text: str, id: int, type: str):
    folder = "titles" if type == "title" else "stories"
    audio_path = f'audio_files/{folder}/{type}_{id}_audio.wav'

    endpoint = os.environ.get("TTS_BASE_URL")

    response = requests.get(endpoint, params={
        "text": text,
        "id": id,
        "type": type
    })
    with open(audio_path, "wb") as f:
        f.write(response.content)

    return audio_path


# add_vocabulary_to_db([{
#     "word": "诸葛亮",
#     "pinyin": "zhùgè liàng",
#     "translation": "legoat"
# }])
# text = "我喜欢学习自然语言处理。"
# text = "自然语言处理是人工智能的重要分支"
# # Precise mode
# words = jieba.cut(text, cut_all=False)
# print("Precise Mode:", "/".join(words))
# 
# import jieba.posseg as pseg

# words = pseg.cut("我喜欢学习自然语言处理。")
# for word, flag in words:
#     print(f"{word} ({flag})")



