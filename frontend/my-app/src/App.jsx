// import { useState } from 'react'
import {Routes, Route} from "react-router-dom"
import Layout from './components/Layout'
import HomePage from './pages/HomePage'
import LoginPage from './pages/LoginPage'
import SearchPage from "./pages/SearchPage"
import StoryPage from "./pages/StoryPage"
import ReviewPage from "./pages/ReviewPage"
import StudyPage from "./pages/StudyPage"
import PhrasesPage from "./pages/PhrasesPage"
import DictionaryPage from "./pages/DictionaryPage"
import StoryHubStoryPage from "./pages/StoryHubStoryPage"
import VerificationSuccessPage from "./pages/VerificationSuccessPage"
import RegisterPage from "./pages/RegisterPage"
import axios from "axios"
import { useState, useEffect } from "react"

function useIsSafari() {
  const [isSafari, setIsSafari] = useState(false);

  useEffect(() => {
    const ua = navigator.userAgent;
    const isSafariBrowser = /^((?!chrome|android).)*safari/i.test(ua) && !ua.includes("Chrome");
    setIsSafari(isSafariBrowser);
    // console.log(isSafari)
  }, []);

  return isSafari;
}

function App() {
  const [user, setUser] = useState({"username": "Guest"});
  const [loadingUser, setLoadingUser] = useState(true); //flag to check if user is still loading

  const apiUrl = import.meta.env.VITE_API_BASE_URL;
  const isSafari = useIsSafari();

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
      {isSafari && (
          <div
            style={{
              backgroundColor: "#ffecb3",
              padding: "1rem",
              marginBottom: "1rem",
              borderRadius: "6px",
              border: "1px solid #ffd54f",
              textAlign: "center",
              fontWeight: "bold",
            }}
            role="alert"
          >
            ⚠️ Safari users: To enable full functionality, please disable &nbsp;<em>Prevent cross-site tracking</em> in Safari settings and switch to public browsing.
          </div>
        )}

        <Routes>
          <Route path="/" element= {<Layout username={user.username} setUser={setUser}/>}>
            <Route index element= {<HomePage />} />
            <Route path="login" element= {<LoginPage setUser={setUser} />} />
            <Route path="register" element= {<RegisterPage />} />
            <Route path="verification-success" element={<VerificationSuccessPage />} />
            <Route path="dictionary/:vocab" element= {<SearchPage user={user} loadingUser={loadingUser} />} />
            <Route path="dictionary" element= {<DictionaryPage user={user} loadingUser={loadingUser}/>} />

            <Route path="story" element = {<StoryPage user={user} loadingUser={loadingUser} />} /> {/*if guest, user_id should be undefined*/}
            <Route path="study" element = {<StudyPage user={user} loadingUser={loadingUser}/>} /> {/* Study vocab with flashcards*/}
            {/* <Route path="fill-in-the-blank" element= {<PhrasesPage />} />  Fill in the blank style game */}
            <Route path="review" element = {<ReviewPage user={user} loadingUser={loadingUser}/>} /> {/* Review past generated stories (see other user's stories)*/}
            <Route path="story/:story_id" element = {<StoryHubStoryPage user={user} loadingUser={loadingUser}/>} /> {/* Phrases game */}

            { /* Add dictionary route*/}
          </Route>
        </Routes>
      </>
  )
}

export default App
