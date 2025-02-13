//import { useState } from 'react'
import {Routes, Route} from "react-router-dom"
import Layout from './components/Layout'
import HomePage from './pages/HomePage'
import LoginPage from './pages/LoginPage'
import SearchPage from "./pages/SearchPage"
import StoryPage from "./pages/StoryPage"

function App() {

  return (
    <Routes>
      <Route path="/" element= {<Layout />}>
        <Route index element= {<HomePage />} />
        <Route path="login" element= {<LoginPage />} />
        <Route path="search/:vocab" element= {<SearchPage />} />

        <Route path="story" element = {<StoryPage />} />
      </Route>
    </Routes>
    
  )
}

export default App
