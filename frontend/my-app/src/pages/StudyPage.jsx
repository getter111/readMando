import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import SearchBar from "../components/Searchbar";
import PropTypes from "prop-types";
import axios from "axios";

export default function StudyPage({ user, loadingUser}) {
  const [vocab, setVocab] = useState("");
  const [deckTitle, setDeckTitle] = useState("Study Deck");
  const [deckVocab, setDeckVocab] = useState([]);

  const navigate  = useNavigate();
  const apiUrl = import.meta.env.VITE_API_BASE_URL;

  const handleEnterKey = (e) => {
    if (e.key === "Enter") {
      if (vocab.trim()) {
        navigate(`/search/${vocab}`)
      }
    }
  };


  const hydratePage = async () => {
    // If user is logged in, fetch their saved vocabulary
    if (user.user_id){
      try {
        const response = await axios.get(`${apiUrl}/users/study_deck`, {withCredentials: true});
        console.log(response)
      } catch (error) {
          console.log("Error fetching user's saved words:", error);
      }
    } else {
      // If user is not logged in, show default flashcards
      setDeckVocab([
        { chinese: "太好了", english: "That's great" },
        { chinese: "你吃了吗？", english: "Have you eaten?" },
        { chinese: "对不起", english: "Sorry" },
      ]);
      console.log("Showing default flashcards for guest user.");
    }
  }

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="bg-white p-6 rounded-xl shadow mb-6">
        <h1 className="text-3xl font-bold text-gray-800">
          {user.username}&apos;s {deckTitle}
        </h1>
        <p className="mt-2 text-gray-600">
          Review vocabulary and phrases personalized to your learning journey.
        </p>
        <p className="text-sm text-gray-500 mt-1">中文 → English</p>
      </div>

      {/* Buttons */}
      <div className="flex justify-between mb-4">
        <button className="bg-blue-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-blue-700 cursor-pointer"
          onClick={() => hydratePage()}>
          Study
        </button>
        <button className="border px-6 py-2 rounded-lg font-medium hover:bg-gray-100">
          Add/Edit Cards
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-4 mb-4 border-b">
        <button className="pb-2 border-b-2 border-blue-600 text-blue-600 font-medium">All (52)</button>
        <button className="pb-2 text-gray-600 hover:text-blue-600">Not Memorized (47)</button>
        <button className="pb-2 text-gray-600 hover:text-blue-600">Memorized (5)</button>
      </div>

      {/* Search + Tools */}
      <div className="flex items-center justify-between mb-4">

        <div className="flex items-center gap-2 ml-4">
          <button className="text-sm bg-gray-100 px-3 py-1 rounded hover:bg-gray-200">Play All</button>
          <button className="text-sm bg-gray-100 px-3 py-1 rounded hover:bg-gray-200">List</button>
          <button className="text-sm bg-gray-100 px-3 py-1 rounded hover:bg-gray-200">Share</button>
          <button className="text-sm bg-gray-100 px-3 py-1 rounded hover:bg-gray-200">CSV</button>
          <button className="text-sm bg-gray-100 px-3 py-1 rounded hover:bg-gray-200">Anki</button>
        </div>
        
        <SearchBar
          placeholder="Type to search..."
          value={vocab}
          onChange={(e) => setVocab(e.target.value)}
          onKeyDown={handleEnterKey}
        />
      </div>

      {/* Flashcards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {[
          { chinese: "太好了", english: "That's great" },
          { chinese: "你吃了吗？", english: "Have you eaten?" },
          { chinese: "对不起", english: "Sorry" },
        ].map((card, idx) => (
          <div key={idx} className="bg-white p-4 rounded-xl shadow">
            <p className="text-xl font-semibold text-black">{card.chinese}</p>
            <p className="text-gray-700">{card.english}</p>
            <div className="flex mt-2 items-center gap-2 text-gray-500">
              <button>🔊</button>
              <button>❤️</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

StudyPage.propTypes ={
  user: PropTypes.shape({
    user_id: PropTypes.number,
    username: PropTypes.string,
    email: PropTypes.string,
    is_verified: PropTypes.bool,
  }),
  loadingUser: PropTypes.bool.isRequired,
}