import { useEffect, useState } from "react";
import SearchBar from "../components/SearchBar";
import PropTypes from "prop-types";
import axios from "axios";

import Flashcard from "../components/Flashcard";
import FlashcardSummary from "../components/FlashcardSummary";
export default function StudyPage({ user, loadingUser}) {
  const [searchBar, setSearchBar] = useState("");
  const [deckTitle, setDeckTitle] = useState("Study Deck");
  
  const [deckVocab, setDeckVocab] = useState([]); // state for vocabulary of user's full deck
  const [filteredDeckVocab, setFilteredDeckVocab] = useState([]); // vocab filtered by active tab filter
  const [displayedDeckVocab, setDisplayedDeckVocab] = useState([]); // search filter applied on top of active tab filter

  const [activeFilter, setActiveFilter] = useState("all"); 
  const [studySession, setStudySession] = useState([]); //current study session

  const [showFlashcards ,setShowFlashcards] = useState(false)
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [flipped, setFlipped] = useState(false)

  const [correctAnswers, setCorrectAnswers] = useState([]);
  const [incorrectAnswers, setIncorrectAnswers] = useState([]);

  const [memorizedCount, setMemorziedCount] = useState(0)
  const [notMemorziedCount, setNotMemorziedCount] = useState(0)
  
  const defaultWords = [
    { word: "谢谢", translation: "Thank you", pinyin: "xièxiè", word_type: "expression" },
    { word: "你", translation: "You", pinyin: "nǐ", word_type: "pronoun" },
    { word: "访问", translation: "Visit", pinyin: "fǎngwèn", word_type: "verb" },
    { word: "我的", translation: "My", pinyin: "wǒde", word_type: "pronoun" },
    { word: "网站", translation: "Website", pinyin: "wǎngzhàn", word_type: "noun" },
    { word: "很", translation: "Very", pinyin: "hěn", word_type: "adverb" },
    { word: "高兴", translation: "Happy", pinyin: "gāoxìng", word_type: "adjective" },
    { word: "认识", translation: "Know/Meet", pinyin: "rènshí", word_type: "verb" },
    { word: "你们", translation: "You (plural)", pinyin: "nǐmen", word_type: "pronoun" }
  ]

  const apiUrl = import.meta.env.VITE_API_BASE_URL;

  //refresh page with lastest data
  useEffect(() => {
    if (!loadingUser && (user.user_id || user.username === "Guest")) {
      hydratePage();
    }
  }, [loadingUser, user]);

  //rerender if tab is pressed
  useEffect(() => {
    if (deckVocab.length) {
      console.log("Applying filter:", activeFilter);
      applyFilter(activeFilter);
    }
  }, [activeFilter]);
  
  // Reapply search filter whenever the tab or search bar changes
  useEffect(() => {
    if (searchBar.trim() === "") {
      setDisplayedDeckVocab(filteredDeckVocab);
    } else {
      const lower = searchBar.toLowerCase();

      const filtered = filteredDeckVocab.filter((item) => 
        item.word.includes(lower) ||
        item.translation.toLowerCase().includes(lower) || 
        item.pinyin.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").includes(lower)
      );

      setDisplayedDeckVocab(filtered);
    }
  }, [filteredDeckVocab, searchBar]);

  const playAudio = async (word) => {
    try {
        const res = await axios(`${apiUrl}/study_deck/tts?word=${encodeURIComponent(word)}`)
        const audio = new Audio(res.data.url)
        await audio.play();
    } catch (err){
        console.error("Audio play failed:", err);     
    }
  };

  const applyFilter = async (filterType) => {
    let filtered = [];

    try {
      //get all vocabIds from the filtered tab, use to display our filtered cards
      if (filterType === "memorized" || filterType === "not memorized") {
          const response = await axios(`${apiUrl}/study_deck/status?status_filter=${filterType}`, {withCredentials: true})
          console.log("tab status:",response.data)

          const vocabIds = response.data.map(item => item.vocab_id);

          filtered = deckVocab.filter(item => vocabIds.includes(item.vocab_id));
          console.log("filtered: ", filtered)

      } else if (filterType === "all") {
          filtered = deckVocab;
      }

      setFilteredDeckVocab(filtered); //which triggers useffect searchbar filter
    } catch (err) {
        console.error("Error applying filter:", err);
    }
  }

  const filterBySearch = (query) => {
    const lower = query.toLowerCase()
    setSearchBar(lower)
  }

  const hydratePage = async () => {
    // If user is logged in, fetch their saved vocabulary
    if (user.user_id){
      try {
        const response = await axios.get(`${apiUrl}/users/study_deck`, {withCredentials: true});
        console.log("user vocab: ",response.data) //[VocabularyResponse]
        setDeckVocab(response.data);
        setDisplayedDeckVocab(response.data);
        setFilteredDeckVocab(response.data)

        //init status population
        const status = await axios.get(`${apiUrl}/study_deck/status`, {withCredentials: true})
        console.log("inital status: ",status.data)

        setMemorziedCount(status.data.memorized.length)
        setNotMemorziedCount(status.data.not_memorized.length)
      } catch (error) {
          console.log("Error fetching user's saved words:", error);
      }
    } else {
        // If user is not logged in, show default flashcards
        setDeckVocab(defaultWords);
        setDisplayedDeckVocab(defaultWords);
        setFilteredDeckVocab(defaultWords);
        console.log("Showing default flashcards for guest user.");
    }
  }

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="bg-white p-6 rounded-xl shadow mb-6">
        <h1 className="text-3xl font-bold text-gray-800 break-words">
          {user.username}&apos;s {deckTitle}
        </h1>
        <p className="mt-2 text-[#666666] break-words">
          Review vocabulary and phrases personalized to your learning journey.
        </p>
      </div>

      <div className="flex gap-4 mb-4">
        <button 
          className="flex-grow bg-blue-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-blue-700 cursor-pointer transition"
          onClick={() => {
            setStudySession(filteredDeckVocab);
            setShowFlashcards((prev) => !prev);
            setCurrentCardIndex(0);
            setCorrectAnswers([]);
            setIncorrectAnswers([]);
          }}
          aria-label={`Study Flashcards button`}   
        >
          Study
        </button>
        <button 
          className="flex-grow border px-6 py-2 rounded-lg font-medium hover:bg-gray-100 cursor-pointer transition"
          aria-label={`Add/Edit Cards Button`}
        >
          Add/Edit Cards
        </button>
      </div>

      <div className="flex gap-4 mb-4 border-b">
        <button 
          className={`pb-2 font-medium cursor-pointer transition ${
            activeFilter === "all"
              ? "text-blue-600 border-b-2 border-blue-600"
              : "text-[#666666] hover:text-blue-600"
          }`}
          aria-label={`Filter by none button`}
          onClick={() => {setActiveFilter("all")}}
        >
          All ({notMemorziedCount+memorizedCount})
        </button>
        <button 
          className={`pb-2 font-medium cursor-pointer transition ${
            activeFilter === "not memorized"
              ? "text-blue-600 border-b-2 border-blue-600"
              : "text-[#666666] hover:text-blue-600"
          }`} 
          aria-label={`Filter by not memorized button`}
          onClick={() => {setActiveFilter("not memorized")}} 
        >
          Not Memorized ({notMemorziedCount})
        </button>
        <button 
          className={`pb-2 font-medium cursor-pointer transition ${
            activeFilter === "memorized"
              ? "text-blue-600 border-b-2 border-blue-600"
              : "text-[#666666] hover:text-blue-600"
          }`}
          aria-label={`Filter by memorized button`}
          onClick={() => {setActiveFilter("memorized")}}
        >
          Memorized ({memorizedCount})
        </button>
      </div>

      <div className="flex justify-start mb-4">
        <SearchBar
          placeholder="Type to search..."
          value={searchBar}
          onChange={(e) => filterBySearch(e.target.value)}
        />

        <div className="flex items-center gap-2 ml-4">
          <button 
            className="text-sm bg-gray-100 px-3 py-1 rounded hover:bg-gray-200 cursor-pointer transition" 
            aria-label={`Share button`}
          >
            Share
          </button>
          <button 
            className="text-sm bg-gray-100 px-3 py-1 rounded hover:bg-gray-200 cursor-pointer transition" 
            aria-label={`Export as CSV button`}
          >
            CSV
          </button>
        </div>
      </div>

      <div className="flex gap-4 flex-wrap">
        {displayedDeckVocab.map((card, idx) => (
          <div key={idx} className="bg-white p-4 rounded-xl shadow flex-grow min-w-[250px] max-w-full">
            <p className="text-xl font-semibold text-black break-words">{card.word}</p>
            <p className="text-gray-900 break-words">{card.pinyin}</p>
            <p className="text-[#666666] break-words">{card.translation} ({card.word_type})</p>
            <div className="flex mt-2 items-center gap-2 text-gray-500">
              <button 
                className="cursor-pointer hover:bg-yellow-300 transition rounded" 
                aria-label={`Play audio for ${card.translation} button`}
                onClick={() => playAudio(card.word)}
              >
                🔊
              </button>
            
              <button 
                className="cursor-pointer hover:bg-pink-300 transition rounded" 
                aria-label={`Add/unadd word: ${card.translation} to study deck button`}
              >
                ❤️
              </button>
            </div>
          </div>
        ))}
      </div>

      {showFlashcards && studySession && (
        <div className="fixed inset-0 bg-white/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-lg max-w-xl w-full max-h-[90vh] overflow-auto relative p-6">
            <div className="flex flex-col items-center gap-4">

              {studySession.length > 0 && currentCardIndex < studySession.length ? (
                <>
                  <button 
                    className="absolute top-3 right-3 text-gray-600 hover:text-gray-800 cursor-pointer hover:bg-gray-300 p-2 rounded-full text-xl transition sm:top-4 sm:right-4"
                    onClick={() => setShowFlashcards(false)}
                    aria-label="Close flashcards button"
                  >
                    ✖
                  </button>

                  <Flashcard
                    dictionary={studySession[currentCardIndex]}
                    onFeedback={(type, word) => {
                      console.log(`Feedback: ${type} for ${word.word}`);
                      
                      if (type == "again") setIncorrectAnswers(prev => [...prev, word]);
                      if (type == "good") setCorrectAnswers(prev => [...prev, word]);
                      if (type == "easy") setCorrectAnswers(prev => [...prev, word]); 

                      setCurrentCardIndex((prev) => prev + 1);
                      setFlipped(false);
                      console.log(currentCardIndex)
                    }}
                    flipped={flipped}
                    setFlipped={setFlipped}
                  />

                  <div className="flex justify-center items-center mt-4 w-full">
                      Card {currentCardIndex + 1} of {studySession.length}
                  </div>
                </>
              ) : (
                <FlashcardSummary
                  correct={correctAnswers.length}
                  incorrect={incorrectAnswers.length}
                  onRepeatAll={() => {
                    setStudySession(deckVocab)
                    setCurrentCardIndex(0);
                    setCorrectAnswers([]);
                    setIncorrectAnswers([]);
                    setFlipped(false);
                  }}
                  onRepeatMistakes={() => {
                    setStudySession(incorrectAnswers);                    
                    setCurrentCardIndex(0);
                    setCorrectAnswers([]);
                    setIncorrectAnswers([]);
                    setFlipped(false);
                  }}
                  onFinish={() => {
                    setShowFlashcards(false);
                    setCurrentCardIndex(0);
                    setCorrectAnswers([]);
                    setIncorrectAnswers([]);
                    setFlipped(false);
                  }}
                />
              )}
            </div>
          </div>
        </div>
      )}
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