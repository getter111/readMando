import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import SearchBar from "../components/SearchBar";
import PropTypes from "prop-types";
import axios from "axios";

export default function StudyPage({ user, loadingUser}) {
  const [vocab, setVocab] = useState(""); //search bar state
  const [deckTitle, setDeckTitle] = useState("Study Deck");
  const [deckVocab, setDeckVocab] = useState([]); // state for vocabulary of user's deck

  const navigate  = useNavigate();
  const apiUrl = import.meta.env.VITE_API_BASE_URL;

  useEffect(() => {
    if (!loadingUser && (user.user_id || user.username === "Guest")) {
      hydratePage();
    }
  }, [loadingUser, user]);
  
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
        console.log(response.data) //[VocabularyResponse]
        setDeckVocab(response.data);
      } catch (error) {
          console.log("Error fetching user's saved words:", error);
      }
    } else {
      // If user is not logged in, show default flashcards
      setDeckVocab([
        { word: "谢谢", translation: "Thank you", pinyin: "xièxiè", word_type: "expression" },
        { word: "你", translation: "You", pinyin: "nǐ", word_type: "pronoun" },
        { word: "访问", translation: "Visit", pinyin: "fǎngwèn", word_type: "verb" },
        { word: "我的", translation: "My", pinyin: "wǒde", word_type: "pronoun" },
        { word: "网站", translation: "Website", pinyin: "wǎngzhàn", word_type: "noun" },
        { word: "很", translation: "Very", pinyin: "hěn", word_type: "adverb" },
        { word: "高兴", translation: "Happy", pinyin: "gāoxìng", word_type: "adjective" },
        { word: "认识", translation: "Know/Meet", pinyin: "rènshí", word_type: "verb" },
        { word: "你们", translation: "You (plural)", pinyin: "nǐmen", word_type: "pronoun" },
      ]);
      console.log("Showing default flashcards for guest user.");
    }
  }

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="bg-white p-6 rounded-xl shadow mb-6">
        <h1 className="text-3xl font-bold text-gray-800 break-words">
          {user.username}&apos;s {deckTitle}
        </h1>
        <p className="mt-2 text-gray-600 break-words">
          Review vocabulary and phrases personalized to your learning journey.
        </p>
      </div>

      {/* Buttons */}
      <div className="flex gap-4 mb-4">
        <button className="flex-grow bg-blue-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-blue-700 cursor-pointer"
        >
          Study
        </button>
        <button className="flex-grow border px-6 py-2 rounded-lg font-medium hover:bg-gray-100 cursor-pointer">
          Add/Edit Cards
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-4 mb-4 border-b">
        <button className="pb-2 border-b-2 border-blue-600 text-blue-600 font-medium cursor-pointer">All (52)</button>
        <button className="pb-2 text-gray-600 hover:text-blue-600 cursor-pointer">Not Memorized (47)</button>
        <button className="pb-2 text-gray-600 hover:text-blue-600 cursor-pointer">Memorized (5)</button>
      </div>

      {/* Search + Tools */}
      <div className="flex justify-start mb-4">
        <SearchBar
          placeholder="Type to search..."
          value={vocab}
          onChange={(e) => setVocab(e.target.value)}
          onKeyDown={handleEnterKey}
        />

        <div className="flex items-center gap-2 ml-4">
          <button className="text-sm bg-gray-100 px-3 py-1 rounded hover:bg-gray-200 cursor-pointer">Share</button>
          <button className="text-sm bg-gray-100 px-3 py-1 rounded hover:bg-gray-200 cursor-pointer">CSV</button>
        </div>
      </div>

      {/* Flashcards */}
      <div className="flex gap-4 flex-wrap">
        {deckVocab.map((card, idx) => (
          <div key={idx} className="bg-white p-4 rounded-xl shadow flex-grow min-w-[250px] max-w-full">
            <p className="text-xl font-semibold text-black break-words">{card.word}</p>
            <p className="text-gray-900 break-words">{card.pinyin}</p>
            <p className="text-gray-900 break-words">{card.translation} [{card.word_type}]</p>
            <div className="flex mt-2 items-center gap-2 text-gray-500">
              <button className="cursor-pointer hover:bg-gray-200">🔊</button>
              <button className="cursor-pointer hover:bg-gray-200">❤️</button>
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