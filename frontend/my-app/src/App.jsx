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
import axios from "axios"
import { useState, useEffect } from "react"

function App() {
  const [user, setUser] = useState({"username": "Guest"});
  const [loadingUser, setLoadingUser] = useState(true); //flag to check if user is still loading

  const apiUrl = import.meta.env.VITE_API_BASE_URL;

  useEffect(() => {
    getUser()
  }, [])

const getUser = async () => {
  try {
    const res = await axios.get(`${apiUrl}/me`, {
      withCredentials: true,
    });
    if (res?.data) {
      setUser(res.data);
      console.log(`Loading data for: ${res.data.username}`);
    } else {
      console.log("No user data returned.");
      setUser({ username: "Guest" });
    }
  } catch (err) {
    console.log("Not authenticated", err);
    setUser({ username: "Guest" }); 
  } finally {
    setLoadingUser(false);
  }
};

  return (
    <>
        <Routes>
          <Route path="/" element= {<Layout username={user.username} setUser={setUser}/>}>
            <Route index element= {<HomePage />} />
            <Route path="login" element= {<LoginPage setUser={setUser} />} />
            <Route path="register" element= {<RegisterPage />} />
            <Route path="search/:vocab" element= {<SearchPage />} />
            <Route path="story" element = {<StoryPage user={user} loadingUser={loadingUser} />} /> {/*if guest, user_id should be undefined*/}
            <Route path="review" element = {<ReviewPage />} />
            <Route path="verification-success" element={<VerificationSuccessPage />} />
            { /* Add dictionary route*/}
          </Route>
        </Routes>
      </>
  )
}

export default App
