// import { useState } from 'react'
import {Routes, Route} from "react-router-dom"
import Layout from './components/Layout'
import HomePage from './pages/HomePage'
import LoginPage from './pages/LoginPage'
import SearchPage from "./pages/SearchPage"
import StoryPage from "./pages/StoryPage"
import ReviewPage from "./pages/ReviewPage"
import VerificationSuccessPage from "./pages/VerificationSuccessPage"
import RegisterPage from "./pages/RegisterPage"

import { useState, useEffect } from "react"

function App() {
  const [user, setUser] = useState({"user": "guest"});

  useEffect(() => {
    console.log("Current user:", user);
  },  [user]);

  return (
    <>
        <Routes>
          <Route path="/" element= {<Layout />}>
            <Route index element= {<HomePage />} />
            <Route path="login" element= {<LoginPage setUser={setUser} />} />
            <Route path="register" element= {<RegisterPage />} />
            <Route path="search/:vocab" element= {<SearchPage />} />
            <Route path="story" element = {<StoryPage user_id={user.user_id}/>} />
            <Route path="review" element = {<ReviewPage />} />
            <Route path="verification-success" element={<VerificationSuccessPage />} />
          </Route>
        </Routes>
        {/* <AudioPlayer audioUrl={"https://zftmkahagsvhgqkvmcop.supabase.co/storage/v1/object/public/audio/audio_files/stories/story_4_audio.wav?"} /> */}
      </>
  )
}

export default App
