// import { useState } from 'react'
import {Routes, Route} from "react-router-dom"
import Layout from './components/Layout'
import HomePage from './pages/HomePage'
import LoginPage from './pages/LoginPage'
import SearchPage from "./pages/SearchPage"
import StoryPage from "./pages/StoryPage"
import ReviewPage from "./pages/ReviewPage"

import AudioPlayer from "./components/AudioPlayer"

// async function addWord(word, translation, pinyin) {
//   const [message, setMessage] = useState("");
//   try {
//     const response = await fetch("/vocabulary/", {
//       method: "POST",
//       headers: { "Content-Type": "application/json" },
//       body: JSON.stringify({ word, translation, pinyin }),
//     });

//     if (response.ok) {
//       console.log("Word added successfully");
//       return "Word added successfully!";
//     } else {
//       const errorData = await response.json();
//       return `Error: ${errorData.detail}`;
//     }
//   } catch (error) {
//     console.error("Error adding vocabulary:", error);
//     return "Error adding word.";
//   }
// }


function App() {

  return (
    <>
        <Routes>
          <Route path="/" element= {<Layout />}>
            <Route index element= {<HomePage />} />
            <Route path="login" element= {<LoginPage />} />
            <Route path="search/:vocab" element= {<SearchPage />} />
            <Route path="story" element = {<StoryPage />} />
            <Route path="review" element = {<ReviewPage />} />
          </Route>
        </Routes>
        <AudioPlayer audioUrl={"https://zftmkahagsvhgqkvmcop.supabase.co/storage/v1/object/public/audio/audio_files/stories/story_1_audio.wav"} />
      </>
  )
}

export default App
