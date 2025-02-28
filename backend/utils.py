# from pypinyin import pinyin, Style
# import some_translation_api  #open source machine translation api
from MeloTTS.melo.api import TTS

# def extractVocab(text: str):
#     words = set(text)  # Extract unique Chinese characters (simplified way)
#     vocab_list = []

#     for word in words:
#         if some_translation_api.is_chinese(word):  # Ensure it's a Chinese character
#             english_translation = some_translation_api.translate(word, target_lang="en")
#             pinyin_rep = " ".join([syllable[0] for syllable in pinyin(word, style=Style.TONE3)])  # Convert to Pinyin with tones

#             vocab_list.append({
#                 "character": word,
#                 "pinyin": pinyin_rep,
#                 "english": english_translation
#             })

#     return vocab_list

##maybe import my own dictionary of words and unknown words can be added by the user to the dictionary using a post lmao


# use melo api to generate tts for the title and story
#type should either be: "story" or "title"
def text_to_audio(text: str, story_id: int, type: str):
    folder = "titles" if type == "title" else "stories"

    speed = 1.0
    device = 'auto'
    model = TTS(language='ZH', device=device)
    speaker_ids = model.hps.data.spk2id
    output_path = f'audio_files/{folder}/{type}_{story_id}_audio.wav'
    model.tts_to_file(text, speaker_ids['ZH'], output_path, speed=speed)

    print(output_path)
    return output_path



text_to_audio("逃学的天?", 1, "title")






"""
import models
from supaDB import vocabulary_crud

common_characters = [
    {"character": "的", "pinyin": "de", "english": "of"},
    {"character": "一", "pinyin": "yī", "english": "one"},
    {"character": "是", "pinyin": "shì", "english": "is"},
    # Add more characters...
]

for char in common_characters:
    vocab_entry = models.VocabularyCreate(
        character=char["character"],
        pinyin=char["pinyin"],
        english=char["english"]
    )
    vocabulary_crud.create_vocabulary(vocab_entry)
"""