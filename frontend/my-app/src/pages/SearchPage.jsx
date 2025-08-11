import { useParams } from "react-router-dom";
import { useState, useEffect } from "react";
import axios from "axios";
import PropTypes from "prop-types";
import ToastNotification from "../components/ToastNotification";
import WordHover from "../components/WordHover";

export default function SearchPage({ user, loadingUser }) {
  const { vocab } = useParams();

  const [results, setResults] = useState(null);
  const [error, setError] = useState(null);
  const [toastMsg, setToastMsg] = useState("");

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
        console.log(rawResults)

        if (!Array.isArray(rawResults) || rawResults.length === 0) {
          setResults(rawResults);
          return;
        }
        const res_example_sentences = await Promise.all(
          rawResults.map(async (item) => {
            // if (Array.isArray(item.example_sentence)) {
            //   return { ...item, example_tokens: item.example_sentence };
            // }

            if (item.example_sentence && typeof item.example_sentence === "string") {
              const tokens = await segmentText(item.example_sentence);
              return { ...item, example_tokens: tokens };
            }

            return { ...item, example_tokens: null };
          })
        );
        
        setResults(res_example_sentences);
        // console.log("Fetched + segmented (API-only):", res_example_sentences);
      } catch (err) {
        console.error("Error fetching vocabulary:", err);
        setError("Failed to fetch vocabulary.");
      }
    };

    fetchVocab();
    console.log(results)
  }, [vocab]);

  const playAudio = async (word) => {
    try {
      const res = await axios(`${apiUrl}/study_deck/tts?word=${encodeURIComponent(word)}`);
      const audio = new Audio(res.data.url);
      await audio.play();
    } catch (err) {
      console.error("Audio play failed:", err);
      setToastMsg("❌ Failed to play audio.");
    }
  };

  const handleAddToStudySet = async (word) => {
    try {
      const res = await axios.post(
        `${apiUrl}/users/study_deck`,
        { word: word },
        { withCredentials: true }
      );
      // console.log(res)

      // Pre-generate TTS on the server
      const tts = await axios.get(`${apiUrl}/study_deck/tts?word=${encodeURIComponent(word)}`);
      // console.log(tts)

      setToastMsg(`✅ Added ${word} to study deck!`);
    } catch (error) {
      if (axios.isAxiosError(error)) {
        if (error.response?.status === 409) {
          setToastMsg(`⚠️ ${word} already in study deck`);
        } else {
          setToastMsg("❌ Failed to add word. Please Login.");
        }
      } else {
        setToastMsg("❌ An unexpected error occurred.");
      }
    }
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h2 className="text-3xl font-bold mb-6">
        Search Results for: <span className="text-blue-600 font-semibold">{vocab}</span>
      </h2>

      {loadingUser && <p className="text-gray-500">Loading...</p>}

      {error && <p className="text-red-500">{error}</p>}

      {!loadingUser && !error && results?.length === 0 && (
        <p className="text-gray-600">No results found.</p>
      )}

      {toastMsg && (
        <ToastNotification
          message={toastMsg}
          onClose={() => setToastMsg("")}
          duration={3000}
        />
      )}

      {!loadingUser && results && results.length > 0 && (
        <div className="space-y-4">
          {results.map((item) => (
            <div
              key={item.vocab_id}
              className="bg-white p-5 rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition flex flex-col gap-3"
            >
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-2xl font-bold text-gray-900">{item.word}</p>
                  <p className="text-lg font-semibold text-gray-700">{item.pinyin}</p>
                  <p className="text-gray-700 font-semibold italic">
                    {item.translation}{" "}
                    <span className="text-sm font-semibold text-gray-400">({item.word_type})</span>
                  </p>
                </div>

                <div className="flex gap-2">
                  <button
                    className="px-3 py-2 rounded-lg hover:bg-yellow-200 cursor-pointer transition"
                    aria-label={`Play audio for ${item.translation}`}
                    onClick={() => playAudio(item.word)}
                  >
                    🔊
                  </button>
                  <button
                    className="px-3 py-2 cursor-pointer bg-blue-100 rounded-lg font-semibold hover:bg-blue-200 transition text-sm"
                    aria-label={`Add ${item.word} to study deck`}
                    onClick={async () => handleAddToStudySet(item.word)}
                  >
                    + Add to study deck
                  </button>
                </div>
              </div>

              {item.example_sentence && (
                <div className="bg-gray-50 p-3 rounded-lg border border-gray-200">
                  <div className="text-gray-800">
                    <span className="font-semibold">Example: </span>
                    {Array.isArray(item.example_tokens) && item.example_tokens.length > 0 ? (
                      item.example_tokens.map((token, idx) => {
                        const isPunct = punctuationRegex.test(token);
                        
                        return (
                          <span key={idx}>
                            {isPunct ? (
                              <span>{token}</span>
                            ) : (
                              <WordHover word={token} />
                            )}
                          </span>
                        );
                      })
                    ) : (
                      <span>{typeof item.example_sentence === 'string' ? item.example_sentence : 'N/A'}</span>
                    )}
                  </div>

                  {/* {item.example_translation && (
                    <p className="text-gray-500 text-sm">{item.example_translation}</p>
                  )} */}
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
