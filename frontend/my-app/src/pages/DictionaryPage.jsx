import { useEffect, useRef, useState, useCallback } from "react";
import axios from "axios";
import PropTypes from "prop-types";
import toast from "react-hot-toast";

const PAGE_SIZE = 30;

export default function DictionaryPage({ user, loadingUser }) {
    const [vocabList, setVocabList] = useState([]);
    const [skip, setSkip] = useState(0);
    const [hasMore, setHasMore] = useState(true);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const apiUrl = import.meta.env.VITE_API_BASE_URL;
    const observer = useRef();

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
        const addToast = toast.loading(`Adding ${word}...`);
        try {
            await axios.post(`${apiUrl}/users/study_deck`, { word }, { withCredentials: true });
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

    const cardStyle = `
        bg-white dark:bg-gray-800 p-6 rounded-2xl border-4 border-gray-900 dark:border-white/10
        shadow-[4px_4px_0_0_rgba(0,0,0,1)] dark:shadow-[4px_4px_0_0_rgba(255,255,255,0.05)]
        hover:translate-y-[-4px] hover:shadow-[8px_8px_0_0_rgba(0,0,0,1)] dark:hover:shadow-[8px_8px_0_0_rgba(255,255,255,0.1)]
        transition-all duration-300 flex flex-col justify-between group
    `;

    return (
        <div className="p-6 max-w-7xl mx-auto pb-20">
            <div className="mb-12 text-center fade-up">
                <h1 className="text-4xl md:text-5xl font-black tracking-tight text-gray-900 dark:text-white mb-4">
                    Mandarin <span className="text-blue-600">Dictionary</span>
                </h1>
                <p className="text-gray-500 dark:text-gray-400 font-medium max-w-2xl mx-auto">
                    Explore thousands of words, see examples, and build your personalized study deck.
                </p>
            </div>

            {error && <p className="text-red-500 font-bold text-center mb-8">{error}</p>}

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                {vocabList.map((item, idx) => {
                    const isLast = idx === vocabList.length - 1;
                    return (
                        <div
                            key={item.vocab_id || idx}
                            ref={isLast ? lastVocabRef : null}
                            className={`${cardStyle} fade-up`}
                            style={{ animationDelay: `${(idx % 8) * 50}ms` }}
                        >
                            <div>
                                <div className="flex justify-between items-start mb-4">
                                    <p className="text-4xl font-black text-gray-900 dark:text-white group-hover:scale-110 transition-transform origin-left duration-300">
                                        {item.word}
                                    </p>
                                    <span className="px-2 py-1 rounded-md bg-gray-100 dark:bg-gray-700 text-[10px] font-black uppercase tracking-widest text-gray-500 dark:text-gray-400">
                                        {item.word_type}
                                    </span>
                                </div>
                                <p className="text-xl font-bold text-blue-600 dark:text-blue-400 mb-1">{item.pinyin}</p>
                                <p className="text-gray-700 dark:text-gray-300 font-bold italic mb-4">
                                    {item.translation}
                                </p>
                                {item.example_sentence && (
                                    <div className="bg-gray-50 dark:bg-gray-900/50 p-4 rounded-xl border-2 border-dashed border-gray-200 dark:border-gray-700 mt-2 text-sm leading-relaxed text-gray-600 dark:text-gray-400">
                                        <span className="font-black text-gray-400 dark:text-gray-500 block mb-1 uppercase text-[10px] tracking-widest">Example</span>
                                        {item.example_sentence}
                                    </div>
                                )}
                            </div>

                            <button
                                onClick={() => handleAddToStudySet(item.word)}
                                className="mt-8 bg-gray-900 dark:bg-white dark:text-gray-900 text-white font-black py-3 rounded-xl hover:translate-y-[-2px] active:translate-y-[1px] transition-all cursor-pointer text-sm shadow-[2px_2px_0_0_rgba(0,0,0,0.2)] dark:shadow-none"
                            >
                                + Add to deck
                            </button>
                        </div>
                    );
                })}
            </div>

            {loading && (
                <div className="flex justify-center py-12">
                    <div className="w-10 h-10 border-4 border-blue-100 border-t-blue-600 rounded-full animate-spin"></div>
                </div>
            )}

            {!hasMore && vocabList.length > 0 && (
                <div className="text-center text-gray-400 dark:text-gray-600 font-black py-12 uppercase tracking-widest text-sm">
                    ✨ End of dictionary ✨
                </div>
            )}
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
