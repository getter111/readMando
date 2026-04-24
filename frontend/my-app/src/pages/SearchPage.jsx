import { useParams } from "react-router-dom";
import { useState, useEffect } from "react";
import axios from "axios";
import PropTypes from "prop-types";
import toast from "react-hot-toast";
import WordHover from "../components/WordHover";

export default function SearchPage({ user, loadingUser }) {
  const { vocab } = useParams();

  const [results, setResults] = useState(null);
  const [error, setError] = useState(null);

  const apiUrl = import.meta.env.VITE_API_BASE_URL;
  const punctuationRegex = /^[.,!?;:(){}\[\]'\"`\-。，！？；：“”【】()、\s\n\r]+$/;

  const segmentText = async (content) => {
    try {
      const res = await axios.post(`${apiUrl}/stories/segment`, { content });
      return Array.isArray(res.data?.segmented_words) ? res.data.segmented_words : null;
    } catch (err) {
      console.error("Segment API failed:\n", content, err);
      return null;
    }
  };

  useEffect(() => {
    const fetchVocab = async () => {
      setError(null);
      try {
        const response = await axios.get(`${apiUrl}/vocabulary/${encodeURIComponent(vocab)}`);
        const rawResults = response.data;

        if (!Array.isArray(rawResults) || rawResults.length === 0) {
          setResults(rawResults);
          return;
        }
        const res_example_sentences = await Promise.all(
          rawResults.map(async (item) => {
            if (item.example_sentence && typeof item.example_sentence === "string") {
              const tokens = await segmentText(item.example_sentence);
              return { ...item, example_tokens: tokens };
            }
            return { ...item, example_tokens: null };
          })
        );
        
        setResults(res_example_sentences);
      } catch (err) {
        console.error("Error fetching vocabulary:", err);
        setError("Failed to fetch vocabulary.");
      }
    };

    fetchVocab();
  }, [vocab]);

  const playAudio = async (word) => {
    try {
      const res = await axios(`${apiUrl}/study_deck/tts?word=${encodeURIComponent(word)}`);
      const audio = new Audio(res.data.url);
      await audio.play();
    } catch (err) {
      console.error("Audio play failed:", err);
      toast.error("Failed to play audio.");
    }
  };

  const handleAddToStudySet = async (word) => {
    const addToast = toast.loading(`Adding ${word}...`);
    try {
      await axios.post(
        `${apiUrl}/users/study_deck`,
        { word: word },
        { withCredentials: true }
      );
      await axios.get(`${apiUrl}/study_deck/tts?word=${encodeURIComponent(word)}`);
      toast.success(`Added ${word} to study deck!`, { id: addToast });
    } catch (error) {
      if (axios.isAxiosError(error)) {
        if (error.response?.status === 409) {
          toast.error(`${word} already in study deck`, { id: addToast });
        } else {
          toast.error("Please login to save words.", { id: addToast });
        }
      } else {
        toast.error("An unexpected error occurred.", { id: addToast });
      }
    }
  };

  const cardStyle = `bg-white dark:bg-gray-800 p-6 rounded-2xl border-4 border-gray-900 dark:border-white/10 shadow-[4px_4px_0_0_rgba(0,0,0,1)] dark:shadow-[4px_4px_0_0_rgba(255,255,255,0.05)] transition-all duration-300 flex flex-col gap-4`;

  return (
    <div className="p-6 max-w-4xl mx-auto pb-20">
      <div className="mb-12 text-center">
        <h2 className="text-3xl md:text-4xl font-black tracking-tight text-gray-900 dark:text-white">
          Results for: <span className="text-blue-600 italic">"{vocab}"</span>
        </h2>
      </div>

      {loadingUser && (
        <div className="flex justify-center py-20">
          <div className="w-10 h-10 border-4 border-blue-100 border-t-blue-600 rounded-full animate-spin"></div>
        </div>
      )}

      {error && (
        <div className="p-4 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-xl border-2 border-red-200 dark:border-red-900/30 font-bold text-center">
          {error}
        </div>
      )}

      {!loadingUser && !error && results?.length === 0 && (
        <div className="text-center py-20 opacity-20">
          <div className="text-6xl mb-4">🤷</div>
          <p className="text-xl font-black dark:text-white">No exact matches found.</p>
        </div>
      )}

      {!loadingUser && results && results.length > 0 && (
        <div className="space-y-8">
          {results.map((item) => (
            <div key={item.vocab_id} className={cardStyle}>
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                <div>
                  <div className="flex items-center gap-3 mb-1">
                    <p className="text-4xl font-black text-gray-900 dark:text-white">{item.word}</p>
                    <span className="px-2 py-1 rounded bg-gray-100 dark:bg-gray-700 text-[10px] font-black uppercase tracking-widest text-gray-500 dark:text-gray-400">
                      {item.word_type}
                    </span>
                  </div>
                  <p className="text-xl font-bold text-blue-600 dark:text-blue-400 mb-1">{item.pinyin}</p>
                  <p className="text-gray-700 dark:text-gray-300 font-bold italic tracking-tight">
                    {item.translation}
                  </p>
                </div>

                <div className="flex gap-2">
                  <button
                    className="p-3 rounded-xl border-2 border-gray-900 dark:border-white/10 bg-yellow-50 dark:bg-yellow-900/20 text-lg shadow-[2px_2px_0_0_rgba(0,0,0,1)] hover:translate-y-[-1px] active:translate-y-[1px] transition-all cursor-pointer"
                    aria-label={`Play audio for ${item.translation}`}
                    onClick={() => playAudio(item.word)}
                  >
                    🔊
                  </button>
                  <button
                    className="flex-1 sm:flex-none px-4 py-2 bg-blue-600 text-white font-black rounded-xl border-2 border-gray-900 shadow-[4px_4px_0_0_rgba(0,0,0,1)] hover:translate-y-[-2px] active:translate-y-[1px] transition-all cursor-pointer text-sm"
                    onClick={() => handleAddToStudySet(item.word)}
                  >
                    + Add to Deck
                  </button>
                </div>
              </div>

              {item.example_sentence && (
                <div className="bg-gray-50 dark:bg-gray-900/50 p-5 rounded-xl border-2 border-dashed border-gray-200 dark:border-gray-700 leading-relaxed">
                  <span className="font-black text-gray-400 dark:text-gray-500 block mb-2 uppercase text-[10px] tracking-widest">Context Sentence</span>
                  <div className="text-gray-800 dark:text-gray-200 text-lg">
                    {Array.isArray(item.example_tokens) && item.example_tokens.length > 0 ? (
                      item.example_tokens.map((token, idx) => {
                        const isPunct = punctuationRegex.test(token);
                        return (
                          <span key={idx}>
                            {isPunct ? <span>{token}</span> : <WordHover word={token} />}
                          </span>
                        );
                      })
                    ) : (
                      <span>{typeof item.example_sentence === 'string' ? item.example_sentence : 'N/A'}</span>
                    )}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

SearchPage.propTypes = {
  user: PropTypes.shape({
    user_id: PropTypes.number,
    username: PropTypes.string,
    email: PropTypes.string,
    is_verified: PropTypes.bool,
  }),
  loadingUser: PropTypes.bool,
};
