# AI-Generated Short Stories

📖 **Live Demo** → [ReadMando (in progress)](https://readmando.netlify.app/)

## About

This project helps Chinese language learners improve their reading comprehension by generating dynamic, customizable short stories. Users can tailor stories to their vocabulary level and reading goals.

## Features

### 📘 Story Generator Page

- **Story Customization**  
  - Customize difficulty, length, and themes of each story.  
  - Choose specific vocabulary to appear in the story for targeted learning.

- **Auto-Generated Comprehension Questions**  
  - At the end of each story, questions are generated automatically to test reading comprehension.

- **Text-to-Speech (TTS)**  
  - Listen along as you read.
  - Uses [MeloTTS](https://github.com/myshell-ai/MeloTTS) to convert Chinese characters into natural-sounding Chinese audio.

- **Easy Vocabulary Lookup**  
  - Hover over any word to see its pinyin, translation, and part-of-speech tag.  
  - Uses the [Jieba](https://github.com/fxsjy/jieba) segmentation library.

- **Unknown Vocabulary Detection**  
  - Unknown words not found in the master vocabulary database are automatically processed.  
  - The app predicts and displays their meaning, part of speech, and pronunciation.

## Deployment

The application is structured as two main microservices. Both built using FastAPI, containerized with Docker, and deployed on [Fly.io](https://fly.io/).

- **Main Backend**:  
This service handles:
  - Story generation
  - Vocabulary processing
  - User authentication and management
  - Supabase interactions

- **TTS**:  
  The TTS functionality is deployed as a separate service using the [MeloTTS](https://github.com/myshell-ai/MeloTTS) library.
