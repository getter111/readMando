//import { useState } from 'react'
import {Routes, Route} from "react-router-dom"
import Layout from './components/Layout'
import HomePage from './pages/HomePage'
import LoginPage from './pages/LoginPage'
import SearchPage from "./pages/SearchPage"
import StoryPage from "./pages/StoryPage"
import PropTypes from "prop-types";

function AudioPlayer({ audioUrl }) {
  return (
      <audio controls>
          <source src={audioUrl} type="audio/wav" />
          Your browser does not support the audio element.
      </audio>
  );
}

function App() {

  return (
    <>
        <Routes>
          <Route path="/" element= {<Layout />}>
            <Route index element= {<HomePage />} />
            <Route path="login" element= {<LoginPage />} />
            <Route path="search/:vocab" element= {<SearchPage />} />

            <Route path="story" element = {<StoryPage />} />
          </Route>
        </Routes>
        <AudioPlayer audioUrl={"https://zftmkahagsvhgqkvmcop.supabase.co/storage/v1/object/public/audio/audio_files/stories/story_1_audio.wav"} />
      </>
  )
}
AudioPlayer.propTypes = {
  audioUrl: PropTypes.string.isRequired, 
};

export default App
