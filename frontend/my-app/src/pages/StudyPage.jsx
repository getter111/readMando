import { useEffect, useState } from "react";
import SearchBar from "../components/SearchBar";
import PropTypes from "prop-types";
import axios from "axios";

import Flashcard from "../components/Flashcard";
import FlashcardSummary from "../components/FlashcardSummary";
import ToastNotification from "../components/ToastNotification";
export default function StudyPage({ user, loadingUser}) {
  const [searchBar, setSearchBar] = useState("");
  const [deckTitle, setDeckTitle] = useState("Study Deck");
  
  const [deckVocab, setDeckVocab] = useState([]); // state for vocabulary of user's full deck
  const [tabFilteredDeckVocab, setTabFilteredDeckVocab] = useState([]); // vocab filtered by active tab filter (also data used for study session)
  const [searchAndTabFilteredDeckVocab, setSearchAndTabFilteredDeckVocab] = useState([]); // search filter applied on top of active tab filter (for search bar)

  const [activeFilter, setActiveFilter] = useState("all"); 
  const [studySession, setStudySession] = useState([]); //current study session

  const [showFlashcards ,setShowFlashcards] = useState(false)
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [flipped, setFlipped] = useState(false)

  const [correctAnswers, setCorrectAnswers] = useState([]);
  const [incorrectAnswers, setIncorrectAnswers] = useState([]);

  const [toastMsg, setToastMsg] = useState("");
  const [mergedVocab, setMergedVocab] = useState([]); // ALL DATA

const [defaultWords, setDefaultWords] = useState([
  { word: "谢谢", translation: "Thank you", pinyin: "xièxiè", word_type: "expression", status:"not memorized", is_active: true},
  { word: "你", translation: "You", pinyin: "nǐ", word_type: "pronoun", status:"not memorized", is_active: true},
  { word: "访问", translation: "Visit", pinyin: "fǎngwèn", word_type: "verb", status:"not memorized", is_active: true},
  { word: "我的", translation: "My", pinyin: "wǒde", word_type: "pronoun",status:"not memorized", is_active: true},
  { word: "网站", translation: "Website", pinyin: "wǎngzhàn", word_type: "noun", status:"not memorized", is_active: true},
  { word: "很", translation: "Very", pinyin: "hěn", word_type: "adverb", status:"not memorized", is_active: true},
  { word: "高兴", translation: "Happy", pinyin: "gāoxìng", word_type: "adjective", status:"not memorized", is_active: true},
  { word: "认识", translation: "Know/Meet", pinyin: "rènshí", word_type: "verb", status:"not memorized", is_active: true},
  { word: "你们", translation: "You (plural)", pinyin: "nǐmen", word_type: "pronoun", status:"not memorized", is_active: true}
]);

  const [memorizedCount, setMemorziedCount] = useState(0)
  const [notMemorziedCount, setNotMemorziedCount] = useState(deckVocab?.length || defaultWords.length)

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
      applyFilter(activeFilter);
    }
  }, [activeFilter]);
  
  // Reapply search filter whenever the tab or search bar changes
  useEffect(() => {
    if (searchBar.trim() === "") {
      setSearchAndTabFilteredDeckVocab(tabFilteredDeckVocab);
    } else {
      const lower = searchBar.toLowerCase();

      const filtered = tabFilteredDeckVocab.filter((item) => 
        item.word.includes(lower) ||
        item.translation.toLowerCase().includes(lower) || 
        item.pinyin.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").includes(lower)
      );

      setSearchAndTabFilteredDeckVocab(filtered);
    }
  }, [tabFilteredDeckVocab, searchBar]);

  useEffect(() => {
    const activeCards = deckVocab.filter(item => item.is_active);

    setMemorziedCount(activeCards.filter(item => item.status === "memorized").length);
    setNotMemorziedCount(activeCards.filter(item => item.status === "not memorized").length);
  }, [deckVocab]);

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

    //local filtering instead of api call
    if (user.user_id) {
      if (filterType === "memorized") {
        filtered = deckVocab.filter(item => item.status === "memorized");
      } 
      else if (filterType === "not memorized") {
        filtered = deckVocab.filter(item => item.status === "not memorized");
      }
      else if (filterType === "all") {
        filtered = deckVocab;
      }
    } else {
        if (filterType === "memorized") {
          filtered = defaultWords.filter(item => item.status === "memorized");
        } 
        else if (filterType === "not memorized") {
          filtered = defaultWords.filter(item => item.status === "not memorized");
        }
        else if (filterType === "all") {
          filtered = defaultWords;
        }
    }

    // console.log(filterType, " tab")
    setTabFilteredDeckVocab(filtered);
  }

  const filterBySearch = (query) => {
    const lower = query.toLowerCase()
    setSearchBar(lower)
  }

  const hydratePage = async () => {
    // If user is logged in, fetch their saved vocabulary
    if (user.user_id) {
      try {
        // fetch user's study deck vocabulary
        const response = await axios.get(`${apiUrl}/users/study_deck`, {withCredentials: true});
        // console.log("/users/study_deck: ",response.data) //[VocabularyResponse]

        //init status population  
        const status = await axios.get(`${apiUrl}/study_deck/status`, {withCredentials: true})
        // console.log("/study_deck/status: ",status.data) //[UserVocabularyBase]

        //create a map of vocab_id to user_vocab_id, for quick filter lookups and simplier api calls inside flashcard component
        const vocabMap = {};

        [...status.data.all].forEach(item => {
            vocabMap[item.vocab_id] = item; // key: vocab_id, value: user_vocab object
        })

        //merge the two arrays based on vocab_id
        const mergedVocab = response.data.map(vocab => ({
          ...vocab,
          ...vocabMap[vocab.vocab_id],
        }))

        // console.log("merged vocab with status:", mergedVocab)
        setMergedVocab(mergedVocab);

        const activeVocab = mergedVocab.filter(card => card.is_active === true);

        setDeckVocab(activeVocab);
        setSearchAndTabFilteredDeckVocab(activeVocab);
        setTabFilteredDeckVocab(activeVocab);

        setMemorziedCount(status.data.memorized.length)
        setNotMemorziedCount(status.data.not_memorized.length)
      } catch (error) {
          console.log("Error fetching user's saved words:", error);
      }
    } else {
        // If user is not logged in load from localStorage
        const localDeck = localStorage.getItem("defaultWords");

        if (localDeck) {
          const parsedLocalDeck = JSON.parse(localDeck);
          const activeLocalDeck = parsedLocalDeck.filter(card => card.is_active === true);

          setDefaultWords(activeLocalDeck);        
          setDeckVocab(activeLocalDeck);
          setSearchAndTabFilteredDeckVocab(activeLocalDeck);
          setTabFilteredDeckVocab(activeLocalDeck);

          setMemorziedCount(activeLocalDeck.filter(item => item.status === "memorized").length);
          setNotMemorziedCount(activeLocalDeck.filter(item => item.status === "not memorized").length);
          // console.log("Parsed local deck:", parsedLocalDeck);
        } 
        else { // first time user is visiting page
          setDeckVocab(defaultWords); //single source of truth
          setSearchAndTabFilteredDeckVocab(defaultWords); //keep track of search filter
          setTabFilteredDeckVocab(defaultWords); //mainly to keep track of current tab filter
        }
    }
  }

  const handleHeartClick = async (user_vocab_id, word) => {

    if (!user.user_id) {
      const updatedWords = defaultWords.map(card => {
        if (card.word === word) {
          return { ...card, is_active: !card.is_active };
        }
        return card;
      });
      // console.log("Updated default words:", updatedWords);

      setToastMsg(updatedWords.find(card => card.word === word).is_active ? `✅ Added ${word} to your deck!` : `❌ Removed ${word} from your deck!`);

      setDefaultWords(updatedWords);
      setDeckVocab(updatedWords);

      setTabFilteredDeckVocab(updatedWords);
      setSearchAndTabFilteredDeckVocab(updatedWords);

      localStorage.setItem("defaultWords", JSON.stringify(updatedWords));
    }
    else {
      const payload = {user_vocab_id: user_vocab_id}

      try {
        const response = await axios.put(`${apiUrl}/study_deck/toggle`, payload, {
          headers: {
            'Content-Type': 'application/json',
          },
          withCredentials: true, // optional, keep if needed
        });    
        const vocabItem = mergedVocab.find(vocab => vocab.user_vocab_id === user_vocab_id);
        // console.log("Updated default words:", vocabItem);

        //update for UI feedback
        setDeckVocab(prevDeck => {
          return prevDeck.map(card => {
            if (card.user_vocab_id === user_vocab_id) {
              
              // Update the toast message based on the new is_active state
              setToastMsg(
                !card.is_active
                  ? `✅ Added ${word} to your deck!`
                  : `❌ Removed ${word} from your deck!`
              )

              return { ...card, is_active: !card.is_active };
            } else {
              return card;
            }
          });
        });

        setTabFilteredDeckVocab(prevFiltered => {
          return prevFiltered.map(card => {
            if (card.user_vocab_id === user_vocab_id) {
              return { ...card, is_active: !card.is_active };
            } else {
              return card;
            }
          });
        });

        setSearchAndTabFilteredDeckVocab(prevFiltered => {
          return prevFiltered.map(card => {
            if (card.user_vocab_id === user_vocab_id) {
              return { ...card, is_active: !card.is_active };
            } else {
              return card;
            }
          });
        })

        // console.log("Toggled vocabulary:", response.data);
      } catch (err) {
        console.error("Error toggling vocabulary:", err);
        return;
      }
    }
  }

  return (
    <>
      {toastMsg && (
        <ToastNotification
          message={toastMsg} 
          onClose={() => setToastMsg("")} 
          duration={3000} 
        />
      )}
      <div className="p-6 bg-gray-50 min-h-screen">
        <div className="bg-white p-6 rounded-xl shadow mb-6">
          <h1 className="text-3xl font-bold text-gray-800 break-words">
            {user.username}&apos;s {deckTitle}
          </h1>
          <p className="mt-2 text-[#666666] break-words">
            Review vocabulary and phrases personalized to your learning journey.
          </p>
        </div>

        <div className="flex justify-center gap-4 mb-4">
          <button 
            className="flex-auto bg-blue-600 text-lg font-semibold text-white px-6 py-3 rounded-lg hover:bg-blue-700 cursor-pointer transition"
            onClick={() => {
              setStudySession(tabFilteredDeckVocab);
              setShowFlashcards((prev) => !prev);
              setCurrentCardIndex(0);
              setCorrectAnswers([]);
              setIncorrectAnswers([]);
            }}
            aria-label={`Study Flashcards button`}   
          >
            Study
          </button>
          {/* <button 
            className="flex-auto border px-6 py-3 text-lg rounded-lg bg-blue-600 text-white font-semibold hover:bg-blue-700 cursor-pointer transition"
            aria-label={`Add/Edit Cards Button`}
          >
            Add/Edit Cards
          </button> */}
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
            {/* <button 
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
            </button> */}
          </div>
        </div>

          <div className="flex flex-wrap justify-center gap-6">
            {searchAndTabFilteredDeckVocab.map((card, idx) => (
            <div 
              key={idx} 
              className="bg-white p-6 rounded-2xl shadow-md flex justify-between items-start flex-grow min-w-[250px] max-w-sm transition hover:shadow-lg"
            >
              <div className="mb-4 space-y-1">
                <p className="text-2xl font-extrabold text-black break-words">{card.word}</p>
                <p className="text-lg text-gray-700 break-words">{card.pinyin}</p>
                <p className="text-gray-500 break-words">{card.translation} ({card.word_type})</p>
              </div>

              <div className="flex items-center gap-3 text-lg">
                <button 
                  className="p-2 cursor-pointer hover:bg-yellow-200 transition rounded-full" 
                  aria-label={`Play audio for ${card.translation} button`}
                  onClick={() => playAudio(card.word)}
                >
                  🔊
                </button>
              
                <button 
                  className="p-2 cursor-pointer hover:bg-pink-200 transition rounded-full" 
                  aria-label={`Add/unadd word: ${card.translation} to study deck button`}
                  onClick={() => handleHeartClick(card.user_vocab_id, card.word)}
                >
                  {card.is_active ? "❤️" : "🤍"}
                </button>
              </div>
            </div>
          ))}
        </div>

        {showFlashcards && studySession && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-white/40 backdrop-blur-sm p-4">
            <div className="bg-white rounded-lg shadow-lg max-w-2xl w-full max-h-[90vh] overflow-auto relative p-15">
              <div className="flex flex-col items-center gap-4">

                {studySession.length > 0 && currentCardIndex < studySession.length ? (
                  <>
                    <button 
                      className="absolute top-3 right-3 text-gray-800 cursor-pointer hover:bg-gray-200 p-3 rounded-full text-xl transition sm:top-4 sm:right-4"
                      onClick={() => setShowFlashcards(false)}
                      aria-label="Close flashcards button"
                    >
                      ✖
                    </button>

                    <Flashcard
                      dictionary={studySession[currentCardIndex]}
                      onFeedback={async (type, dict) => {

                        console.log(`Feedback: ${type} for ${dict.word}`);

                        const payload = {
                          user_vocab_id: dict.user_vocab_id,
                          feedback: type,
                        }

                        if (user.user_id) {
                          try {
                            await axios.put(`${apiUrl}/study_deck/update`, payload, { withCredentials: true });
                            // console.log("Updated vocab progress");
                          } catch (err) {
                            console.error("Failed to update vocab:", err);
                          }
                        } else { //guest user
                          const updatedWords = [...defaultWords];
                          const index = updatedWords.findIndex(item => item.word === dict.word);

                          if (index !== -1) {
                            updatedWords[index] = {
                              ...updatedWords[index],
                              status: type === "again" ? "not memorized" : "memorized"
                            };
                            setDefaultWords(updatedWords); //update defaultword state, to be used at end of session
                          }
                        }
                        console.log(studySession[currentCardIndex])

                        //update our counts for flashcard summary and repeat mistake logic
                        if (type == "again") setIncorrectAnswers(prev => [...prev, dict]);
                        if (type == "good") setCorrectAnswers(prev => [...prev, dict]);
                        if (type == "easy") setCorrectAnswers(prev => [...prev, dict]); 
                        
                        setCurrentCardIndex((prev) => prev + 1);
                        setFlipped(false); //return to front side after feedback
                        // console.log(currentCardIndex)
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
                    onFinish={async () => {
                      setShowFlashcards(false);
                      setCurrentCardIndex(0);
                      setCorrectAnswers([]);
                      setIncorrectAnswers([]);
                      setFlipped(false);

                      //updates memorized/not memorized counts when user finishes session
                      if (!user.user_id) {
                        localStorage.setItem("defaultWords", JSON.stringify(defaultWords));
                      }
                      await hydratePage(); 
                    }}
                  />
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </>
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