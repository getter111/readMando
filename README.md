# AI Generated Short Stories

Welcome to ReadMando, 
live demo -> [ReadMando (in progress)](https://readmando.netlify.app/)

## About

This project generates Chinese short stories with the help of AI. Chinese language learners can generate and customize their short stories to start practicing their reading comprehension.

## Features
- **AI-Generated Stories**: Automatically generates Chinese short stories using AI.
- **Customization Options**: 
  - Users can customize the difficulty, length, and themes of the stories.
  - Users can choose specific vocabulary they want to appear in the short stories to target certain words or concepts.
- **Auto-Generated Questions**: At the end of each story, the AI generates questions related to the content to test reading comprehension.
- **Text to Speech**: Utilizes MeloTTS library to translate Chinese characters into English audio
    - link -> https://github.com/myshell-ai/MeloTTS 
- **Hover/Word Segmentation**:
  - Users can hover over words to see pinyin, translation, and part-of-speech tags.
  - Utilizes Jieba library to segment words into a logical text structure.
    - link -> https://github.com/fxsjy/jieba  

## Deployment
Currently structured as two main services. Both built with FastAPI, containerized using Docker, and deployed via [Fly.io](https://fly.io/).

- **Main Backend**:  
This service handles:
  - Story generation
  - Vocabulary processing
  - User authentication and management
  - Supabase interactions

- **TTS**:  
  The TTS functionality is deployed as a separate service using the [MeloTTS](https://github.com/myshell-ai/MeloTTS) library.

- **In Progress Features**:
  - App will detect if words are not present in the master vocabulary database while processing the story.
  - App will predict the meaning of these unfamiliar words.
  - Registered users can edit the words and choose to add these words to the master vocabulary database, for the betterment of the app.
  - There may be special rewards for contributors who actively engage and help improve the database of vocabulary.