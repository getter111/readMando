import { useEffect, useState, useCallback } from "react";
import SearchBar from "../components/SearchBar";
import PropTypes from "prop-types";
import axios from "axios";

import Flashcard from "../components/Flashcard";
import FlashcardSummary from "../components/FlashcardSummary";
import ToastNotification from "../components/ToastNotification";
import VocabCard from "../components/VocabCard";

export default function StudyPage({ user, loadingUser }) {
  const [searchBar, setSearchBar] = useState("");
  const [deckVocab, setDeckVocab] = useState([]);
  const [tabFilteredDeckVocab, setTabFilteredDeckVocab] = useState([]);
  const [searchAndTabFilteredDeckVocab, setSearchAndTabFilteredDeckVocab] = useState([]);
  const [activeFilter, setActiveFilter] = useState("all");
  const [studySession, setStudySession] = useState([]);
  const [showFlashcards, setShowFlashcards] = useState(false);
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [correctAnswers, setCorrectAnswers] = useState([]);
  const [incorrectAnswers, setIncorrectAnswers] = useState([]);
  const [toastMsg, setToastMsg] = useState("");
  const [mergedVocab, setMergedVocab] = useState([]);
  const [memorizedCount, setMemorziedCount] = useState(0);
  const [notMemorziedCount, setNotMemorziedCount] = useState(0);

  const [defaultWords, setDefaultWords] = useState([
    { word: "谢谢", translation: "Thank you", pinyin: "xièxiè", word_type: "expression", status: "not memorized", is_active: true },
    { word: "你", translation: "You", pinyin: "nǐ", word_type: "pronoun", status: "not memorized", is_active: true },
    { word: "访问", translation: "Visit", pinyin: "fǎngwèn", word_type: "verb", status: "not memorized", is_active: true },
    { word: "我的", translation: "My", pinyin: "wǒde", word_type: "pronoun", status: "not memorized", is_active: true },
    { word: "网站", translation: "Website", pinyin: "wǎngzhàn", word_type: "noun", status: "not memorized", is_active: true },
    { word: "很", translation: "Very", pinyin: "hěn", word_type: "adverb", status: "not memorized", is_active: true },
    { word: "高兴", translation: "Happy", pinyin: "gāoxìng", word_type: "adjective", status: "not memorized", is_active: true },
    { word: "认识", translation: "Know/Meet", pinyin: "rènshí", word_type: "verb", status: "not memorized", is_active: true },
    { word: "你们", translation: "You (plural)", pinyin: "nǐmen", word_type: "pronoun", status: "not memorized", is_active: true }
  ]);

  const apiUrl = import.meta.env.VITE_API_BASE_URL;

  const hydratePage = useCallback(async () => {
    if (user.user_id) {
      try {
        const response = await axios.get(`${apiUrl}/users/study_deck`, { withCredentials: true });
        const status = await axios.get(`${apiUrl}/study_deck/status`, { withCredentials: true });
        const vocabMap = {};
        status.data.all.forEach(item => { vocabMap[item.vocab_id] = item; });
        const merged = response.data.map(vocab => ({ ...vocab, ...vocabMap[vocab.vocab_id] }));
        setMergedVocab(merged);
        const activeVocab = merged.filter(card => card.is_active);
        setDeckVocab(activeVocab);
        setMemorziedCount(status.data.memorized.length);
        setNotMemorziedCount(status.data.not_memorized.length);
      } catch (error) { console.error(error); }
    } else {
      const localDeck = localStorage.getItem("defaultWords");
      if (localDeck) {
        const parsed = JSON.parse(localDeck);
        const active = parsed.filter(card => card.is_active);
        setDefaultWords(active);
        setDeckVocab(active);
      } else {
        setDeckVocab(defaultWords);
        localStorage.setItem("defaultWords", JSON.stringify(defaultWords));
      }
    }
  }, [user, apiUrl, defaultWords]);

  useEffect(() => {
    if (!loadingUser && (user.user_id || user.username === "Guest")) hydratePage();
  }, [loadingUser, user, hydratePage]);

  useEffect(() => {
    let filtered = deckVocab;
    if (activeFilter !== "all") {
      filtered = deckVocab.filter(item => item.status === activeFilter);
    }
    setTabFilteredDeckVocab(filtered);
  }, [activeFilter, deckVocab]);

  useEffect(() => {
    const lower = searchBar.toLowerCase();
    const filtered = tabFilteredDeckVocab.filter((item) => 
      item.word.includes(lower) ||
      item.translation.toLowerCase().includes(lower) || 
      item.pinyin.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").includes(lower)
    );
    setSearchAndTabFilteredDeckVocab(filtered);
  }, [tabFilteredDeckVocab, searchBar]);

  const playAudio = async (word) => {
    try {
        const res = await axios(`${apiUrl}/study_deck/tts?word=${encodeURIComponent(word)}`);
        const audio = new Audio(res.data.url);
        await audio.play();
    } catch (err) { console.error(err); }
  };

  const handleHeartClick = async (user_vocab_id, word) => {
    if (!user.user_id) {
      const updated = defaultWords.map(c => c.word === word ? { ...c, is_active: !c.is_active } : c);
      setToastMsg(updated.find(c => c.word === word).is_active ? `✅ Added ${word}!` : `❌ Removed ${word}`);
      setDefaultWords(updated);
      setDeckVocab(updated.filter(c => c.is_active));
    } else {
      try {
        await axios.put(`${apiUrl}/study_deck/toggle`, { user_vocab_id }, { withCredentials: true });
        setDeckVocab(prev => prev.map(c => c.user_vocab_id === user_vocab_id ? { ...c, is_active: !c.is_active } : c).filter(c => c.is_active));
        setToastMsg(`Toggled ${word}`);
      } catch (err) { console.error(err); }
    }
  };

  const cardStyle = `bg-white dark:bg-gray-800 p-8 rounded-2xl border-4 border-gray-900 dark:border-white/10 shadow-[4px_4px_0_0_rgba(0,0,0,1)] dark:shadow-[4px_4px_0_0_rgba(255,255,255,0.05)] transition-all`;

  return (
    <div className="min-h-screen pb-20 px-6 max-w-7xl mx-auto">
      {toastMsg && <ToastNotification message={toastMsg} onClose={() => setToastMsg("")} />}
      
      <div className="mb-12 text-center fade-up">
        <h1 className="text-4xl md:text-5xl font-black tracking-tight text-gray-900 dark:text-white mb-4">
          Study <span className="text-blue-600">Deck</span>
        </h1>
        <p className="text-gray-500 dark:text-gray-400 font-medium max-w-2xl mx-auto">
          Review your personalized vocabulary using spaced-repetition flashcards.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Stats & Actions */}
        <div className="lg:col-span-1 space-y-6 fade-up" style={{ animationDelay: '100ms' }}>
          <div className={`${cardStyle} flex flex-col items-center text-center`}>
            <div className="text-5xl mb-4">🗂️</div>
            <h2 className="text-xl font-black dark:text-white mb-6">Your Progress</h2>
            <div className="w-full space-y-4">
              <div className="flex justify-between items-center p-3 bg-green-50 dark:bg-green-900/20 rounded-xl border-2 border-green-200 dark:border-green-900/30">
                <span className="font-bold text-green-700 dark:text-green-400">Memorized</span>
                <span className="font-black text-xl text-green-800 dark:text-green-300">{memorizedCount}</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-blue-50 dark:bg-blue-900/20 rounded-xl border-2 border-blue-200 dark:border-blue-900/30">
                <span className="font-bold text-blue-700 dark:text-blue-400">Learning</span>
                <span className="font-black text-xl text-blue-800 dark:text-blue-300">{notMemorziedCount}</span>
              </div>
            </div>
            
            <button 
              className="w-full mt-8 bg-blue-600 text-white font-black py-4 rounded-2xl border-4 border-gray-900 dark:border-white/10 shadow-[4px_4px_0_0_rgba(0,0,0,1)] dark:shadow-[4px_4px_0_0_rgba(255,255,255,0.1)] hover:translate-y-[-2px] hover:shadow-[6px_6px_0_0_rgba(0,0,0,1)] active:translate-y-[1px] active:shadow-none transition-all cursor-pointer"
              onClick={() => {
                setStudySession(tabFilteredDeckVocab);
                setShowFlashcards(true);
              }}
            >
              Start Session
            </button>
          </div>
        </div>

        {/* Main Content */}
        <div className="lg:col-span-3 space-y-8 fade-up" style={{ animationDelay: '200ms' }}>
          <div className="flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="flex gap-2 p-1 bg-gray-100 dark:bg-gray-800 rounded-2xl border-2 border-gray-900 dark:border-white/10">
              {['all', 'not memorized', 'memorized'].map(f => (
                <button
                  key={f}
                  onClick={() => setActiveFilter(f)}
                  className={`px-4 py-2 rounded-xl font-black text-xs uppercase tracking-widest transition-all ${
                    activeFilter === f 
                    ? 'bg-gray-900 text-white dark:bg-white dark:text-gray-900 shadow-lg' 
                    : 'text-gray-500 hover:text-gray-900 dark:hover:text-white'
                  }`}
                >
                  {f}
                </button>
              ))}
            </div>
            <div className="w-full md:w-72">
              <SearchBar placeholder="Search your deck..." value={searchBar} onChange={(e) => setSearchBar(e.target.value)} />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
            {searchAndTabFilteredDeckVocab.map((card, idx) => (
              <VocabCard key={idx} card={card} onPlayAudio={playAudio} onHeartClick={handleHeartClick} />
            ))}
            {searchAndTabFilteredDeckVocab.length === 0 && (
              <div className="col-span-full py-20 text-center opacity-20">
                <div className="text-6xl mb-4">🔍</div>
                <p className="text-xl font-black">No words found matching that filter.</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {showFlashcards && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-md p-4 animate-in fade-in duration-300">
            <div className={`${cardStyle} max-w-2xl w-full p-12 relative overflow-visible`}>
              <button 
                className="absolute -top-4 -right-4 w-12 h-12 bg-white dark:bg-gray-800 border-4 border-gray-900 rounded-full flex items-center justify-center font-black shadow-lg hover:scale-110 active:scale-95 transition-all cursor-pointer z-10"
                onClick={() => setShowFlashcards(false)}
              >
                ✕
              </button>
              
              {studySession.length > 0 && currentCardIndex < studySession.length ? (
                <div className="flex flex-col items-center gap-8">
                  <div className="w-full h-2 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden border-2 border-gray-900">
                    <div 
                      className="h-full bg-blue-600 transition-all duration-500"
                      style={{ width: `${((currentCardIndex + 1) / studySession.length) * 100}%` }}
                    ></div>
                  </div>
                  <Flashcard
                    dictionary={studySession[currentCardIndex]}
                    onFeedback={async (type, dict) => {
                      if (user.user_id) {
                        try {
                          await axios.put(`${apiUrl}/study_deck/update`, { user_vocab_id: dict.user_vocab_id, feedback: type }, { withCredentials: true });
                        } catch (err) { console.error(err); }
                      }
                      if (type === "again") setIncorrectAnswers(prev => [...prev, dict]);
                      else setCorrectAnswers(prev => [...prev, dict]);
                      setCurrentCardIndex(prev => prev + 1);
                      setFlipped(false);
                    }}
                    flipped={flipped}
                    setFlipped={setFlipped}
                  />
                  <span className="font-black text-gray-400 uppercase tracking-widest text-xs">
                    Card {currentCardIndex + 1} of {studySession.length}
                  </span>
                </div>
              ) : (
                <FlashcardSummary
                  correct={correctAnswers.length}
                  incorrect={incorrectAnswers.length}
                  onRepeatAll={() => { setStudySession(deckVocab); setCurrentCardIndex(0); setCorrectAnswers([]); setIncorrectAnswers([]); setFlipped(false); }}
                  onRepeatMistakes={() => { setStudySession(incorrectAnswers); setCurrentCardIndex(0); setCorrectAnswers([]); setIncorrectAnswers([]); setFlipped(false); }}
                  onFinish={() => { setShowFlashcards(false); hydratePage(); }}
                />
              )}
            </div>
        </div>
      )}
    </div>
  );
}

StudyPage.propTypes = {
  user: PropTypes.shape({ user_id: PropTypes.number, username: PropTypes.string, email: PropTypes.string, is_verified: PropTypes.bool }),
  loadingUser: PropTypes.bool.isRequired,
};
