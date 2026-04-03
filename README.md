# ReadMando

[![GitHub issues](https://img.shields.io/github/issues/getter111/readMando)](https://github.com/getter111/readMando/issues)
[![GitHub pull requests](https://img.shields.io/github/issues-pr/getter111/readMando)](https://github.com/getter111/readMando/pulls)
[![GitHub Repo stars](https://img.shields.io/github/stars/getter111/readMando)](https://github.com/getter111/readMando)
[![GitHub forks](https://img.shields.io/github/forks/getter111/readMando)](https://github.com/getter111/readMando/network/members)

<div align="center">

*ReadMando is an AI-powered learning platform that helps Mandarin Chinese learners build reading comprehension and vocabulary knowledge through interactive, personalized short stories.*

</div>

**Live Demo** → [ReadMando](https://readmando.netlify.app/)

## 🔥 Core Features

- **Story Generator:** Choose your story’s difficulty, length, and theme. Insert specific vocabulary you want to practice!
- **Built-In Comprehension Questions:** Every story ends with auto-generated questions to help you reinforce what you just read.
- **Text-to-Speech (TTS):** Hear native-like pronunciation while reading. Powered by edge-tts for high-quality Mandarin audio playback.
- **Instant Vocabulary Lookup:** Click on any word to view its pinyin, English translation, and part-of-speech tag. Built using the Jieba segmentation library.
- **Unknown Word Detection:** The system automatically detects and annotates unfamiliar words with predicted definitions.

## ✨ Additional Features

- **Vocabulary Flashcards:** Automatically add any words from your stories into your study deck. Review at your own pace using custom flashcards with pinyin, definitions, and part of speech. Designed to support spaced repetition and personalized practice.
- **Search Bar:** Search by Mandarin or English using the search bar. Supports partial matches to help you find relevant vocabulary. Directly add any word to your personalized vocabulary deck.
- **Dictionary:** Explore a Chinese -> English dictionary of over 7000 words. Infinite scrolling. Directly add any word from the dictionary page to your personalized vocabulary deck.
- **Story Hub:** Browse a growing library of stories created by other learners. Revisit your past generated stories and upvote stories you like. See what stories other people are reading.

## 🏗 Architecture & Deployment

The backend is built with **FastAPI**, containerized using **Docker**, and deployed with [Fly.io](https://fly.io/):

- **Core Backend:** Story generation, vocabulary processing and storage, user authentication, Supabase integration, Text-to-Speech.

Please refer to the [Contributing Guide](./CONTRIBUTING.md) for local setup and development instructions.

## 🤝 Feedback & Contributions

Got an idea to improve ReadMando? Feel free to reach out via [email](mailto:alexlin7211@gmail.com) or check out our [Contributing Guide](./CONTRIBUTING.md).
