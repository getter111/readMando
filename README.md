# ReadMando — *The Platform That Turns Stories into Fluency*

**Live Demo** → [ReadMando](https://readmando.netlify.app/)

---

## Overview

**ReadMando** is an AI-powered learning platform that helps Mandarin Chinese learners build reading comprehension and vocabulary knowledge through interactive, personalized short stories. Learners can explore, create, and master Mandarin Chinese, one story at a time.

---

## Core Features

### Story Generator
- **Customizable Stories**  
  Choose your story’s difficulty, length, and theme. 
  Insert specific vocabulary you want to practice! 
  
- **Built-In Comprehension Questions**  
  Every story ends with auto-generated questions to help you reinforce what you just read.

- **Text-to-Speech (TTS)**  
  Hear native-like pronunciation while reading. 
  Powered by [edge-tts](https://github.com/rany2/edge-tts) for high-quality Mandarin audio playback.

- **Instant Vocabulary Lookup**  
  Click on any word to view its pinyin, English translation, and part-of-speech tag. 
  Built using the [Jieba](https://github.com/fxsjy/jieba) segmentation library.

- **Unknown Word Detection**  
  The system automatically detects and annotates unfamiliar words with predicted definitions.

---

### Vocabulary Flashcards
- Automatically add any words from your stories into your study deck.
- Review at your own pace using custom flashcards with pinyin, definitions, and part of speech.
- Designed to support spaced repetition and personalized practice.

---

### Fill-in-the-Blank
- An interactive cloze-style activity based on your study deck.
- Test your understanding by completing sentences using words from your active vocabulary set.
- Great for retention and active recall.

---

### Story Hub
- Browse a growing library of stories created by other learners.
- Revisit your past generated stories and review comprehension questions.
- A collaborative and evolving learning resource.

---

## Architecture & Deployment

The backend is built with **FastAPI**, containerized using **Docker**, and deployed with [Fly.io](https://fly.io/):

- **Core Backend**
  - Story generation
  - Vocabulary processing and storage
  - User authentication and session handling
  - Supabase integration for data storage
  - Text-to-Speech
   
---

## Feedback & Contributions

Got an idea to improve ReadMando?  
Feel free to reach out via [email](mailto:alexlin7211@gmail.com). 
All suggestions and contributions are welcome!