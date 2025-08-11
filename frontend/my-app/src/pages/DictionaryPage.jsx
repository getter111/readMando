import { useEffect, useRef, useState, useCallback } from "react";
import axios from "axios";
import PropTypes from "prop-types";
import ToastNotification from "../components/ToastNotification";

const PAGE_SIZE = 30;

export default function DictionaryPage({ user, loadingUser }) {
    const [vocabList, setVocabList] = useState([]);
    const [skip, setSkip] = useState(0);
    const [hasMore, setHasMore] = useState(true);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const [toastMsg, setToastMsg] = useState("")

    const apiUrl = import.meta.env.VITE_API_BASE_URL;
    const observer = useRef();


    //prevent making new function instance with a new identity every render
    const fetchVocab = useCallback(async () => {
        if (loading || !hasMore) return;
        setLoading(true);
        setError(null);

        try {
            const res = await axios.get(`${apiUrl}/vocabulary/all?skip=${skip}&limit=${PAGE_SIZE}`);
            const data = res.data;
            setVocabList((prev) => [...prev, ...data]);
            setHasMore(data.length === PAGE_SIZE);
            setSkip((prev) => prev + PAGE_SIZE);
        } catch (err) {
            setError("Failed to load vocabulary.");
            setHasMore(false);
        } finally {
            setLoading(false);
        }
    }, [apiUrl, skip, loading, hasMore]);

    useEffect(() => {
        fetchVocab();
    }, []);

    const lastVocabRef = useCallback(
        (node) => {
            if (loading) return;
            if (observer.current) observer.current.disconnect();
            observer.current = new window.IntersectionObserver((entries) => {
                if (entries[0].isIntersecting && hasMore) {
                    fetchVocab();
                }
            });
            if (node) observer.current.observe(node);
        },
        [loading, hasMore, fetchVocab]
    );


    const handleAddToStudySet = async (word) => {
        try {
            const res = await axios.post(`${apiUrl}/users/study_deck`,{ word: word },{ withCredentials: true });
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

            {toastMsg && (
                <ToastNotification
                    message={toastMsg}
                    onClose={() => setToastMsg("")}
                    duration={3000}
                />
            )}

            <h2 className="text-3xl font-bold mb-6">Dictionary</h2>

            {error && <p className="text-red-500">{error}</p>}

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-10">
                {vocabList.map((item, idx) => {
                    const isLast = idx === vocabList.length - 1;
                    return (

                    <div
                        key={item.vocab_id || idx}
                        ref={isLast ? lastVocabRef : null}
                        className="bg-white p-8 rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition flex flex-col justify-between"
                    >
                        {/* Word info */}
                        <div>
                            <p className="text-2xl font-bold text-gray-900">{item.word}</p>
                            <p className="text-lg font-semibold text-gray-700">{item.pinyin}</p>
                            <p className="text-gray-700 font-semibold italic">
                                {item.translation}{" "}
                                <span className="text-sm font-semibold text-gray-400">
                                    ({item.word_type})
                                </span>
                            </p>
                            {item.example_sentence && (
                                <div className="bg-gray-50 p-3 rounded-lg border border-gray-200 mt-2">
                                    <span className="font-semibold">Example: </span>
                                    <span>
                                        {typeof item.example_sentence === "string" ? item.example_sentence : "N/A"}
                                    </span>
                                </div>
                            )}
                        </div>

                        <button
                            onClick={() => handleAddToStudySet(item.word)}
                            className="mt-4 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition cursor-pointer"
                        >
                            Add to study deck
                        </button>
                    </div>
                    );
                })}


                {loading && (
                    <div className="text-center text-gray-500 py-4">Loading...</div>
                )}

                {!hasMore && vocabList.length > 0 && (
                    <div className="text-center text-gray-400 py-4">
                        End of dictionary.
                    </div>
                )}
            </div>
        </div>
        );
    }


DictionaryPage.propTypes = {
    user: PropTypes.shape({
        user_id: PropTypes.number,
        username: PropTypes.string,
        email: PropTypes.string,
        is_verified: PropTypes.bool,
    }),
    loadingUser: PropTypes.bool.isRequired,
};
