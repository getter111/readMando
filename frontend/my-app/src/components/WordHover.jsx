import { useState, useRef, useEffect } from "react";
import PropTypes from "prop-types";
import axios from 'axios';
import ToastNotification from "./ToastNotification";

//pass in from netlify
const apiUrl = import.meta.env.VITE_API_BASE_URL;

function WordHover({ word }) {
    const [translation, setTranslation] = useState("");
    const [pinyin, setPinyin] = useState("");
    const [partOfSpeech, setPartOfSpeech] = useState("");

    const [isLoading, setIsLoading] = useState(false);
    const [notFound, setNotFound] = useState(false);
    const [showTooltip, setShowTooltip] = useState(false);
    const [highlight, setHighlight] = useState("");

    const tooltipRef = useRef(null);
    const localKey = `word:${word}`; //key for localstorage
    
    const [toastMsg, setToastMsg] = useState("");

    function setState(definition){
        setTranslation(definition.translation);
        setPinyin(definition.pinyin);
        setPartOfSpeech(definition.wordType);
        setNotFound(false);
    }    

    async function fetchTranslation() {
        const localValue = localStorage.getItem(localKey);
        if (localValue) {
            setState(JSON.parse(localValue));
            return;
        }
        setIsLoading(true);
        try {
            const response = await axios.get(`${apiUrl}/vocabulary/${word}`);
            if (!response.data || response.data.length === 0 || response.data[0]?.statusCode) {
                throw { isAxiosError: true, response: { status: 404 } };
            }
            const definition = {
                word: response.data[0].word,
                translation: response.data[0].translation,
                pinyin: response.data[0].pinyin,
                wordType: response.data[0].word_type,
            }
            localStorage.setItem(localKey, JSON.stringify(definition));
            setState(definition);
        } catch (error) {
            if (axios.isAxiosError(error) && error.response?.status === 404) {
                setNotFound(true);
                setHighlight("not-found");
                try {
                    const newWord = await axios.post(`${apiUrl}/vocabulary`, { vocab: word });
                    const definition = {
                        word: newWord.data.word,
                        translation: newWord.data.translation,
                        pinyin: newWord.data.pinyin,
                        wordType: newWord.data.word_type,
                    }
                    localStorage.setItem(localKey, JSON.stringify(definition));
                    setState(definition);
                    setHighlight("found");
                } catch (autoFetchError) {
                    setNotFound(true);
                }
            } else {
                setNotFound(true);
            }
        } finally {
            setIsLoading(false);
        }
    }   

    const toggleTooltip = () => {
        const nextState = !showTooltip;
        setShowTooltip(nextState);
        setHighlight(nextState ? "found" : "");
        if (nextState) fetchTranslation();
    };

    const handleClickOutside = (e) => {
        if (tooltipRef.current && !tooltipRef.current.contains(e.target)) {
            setShowTooltip(false);
            setHighlight("");
        }
    };

    useEffect(() => {
        if (showTooltip) {
            document.addEventListener("mousedown", handleClickOutside);
        } else {
            document.removeEventListener("mousedown", handleClickOutside);
        }
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [showTooltip]);

    const handleAddToStudySet = async () => {
        try {
            await axios.post(`${apiUrl}/users/study_deck`, { word }, { withCredentials: true });
            await axios.get(`${apiUrl}/study_deck/tts?word=${encodeURIComponent(word)}`);
            setToastMsg(`✅ Added ${word} to study deck!`);
        } catch (error) {
            if (axios.isAxiosError(error) && error.response?.status === 409) {
                setToastMsg(`⚠️ ${word} already in study deck`);               
            } else {
                setToastMsg("❌ Please Login to save words.");
            }
        }
    };

    return (
        <>
            {toastMsg && <ToastNotification message={toastMsg} onClose={() => setToastMsg("")} duration={3000} />}
            <div className="relative inline-block">
                <span
                    onClick={toggleTooltip}
                    className={`cursor-pointer transition-all duration-200 border-b-2 border-dashed border-gray-400 dark:border-gray-600 px-0.5 rounded-sm ${
                        highlight === "found"
                            ? "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 border-green-500"
                            : highlight === "not-found"
                            ? "bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400 border-yellow-500"
                            : "hover:bg-blue-100 dark:hover:bg-blue-900/30"
                    }`}
                >
                    {word}
                </span>
                {showTooltip && (
                    <div
                        ref={tooltipRef}
                        className="fixed sm:absolute bottom-4 sm:bottom-full left-4 right-4 sm:left-1/2 sm:-translate-x-1/2 sm:w-max max-w-xs bg-white dark:bg-gray-800 p-6 rounded-2xl border-4 border-gray-900 dark:border-white/10 shadow-[8px_8px_0_0_rgba(0,0,0,1)] dark:shadow-[8px_8px_0_0_rgba(255,255,255,0.05)] z-50 animate-in fade-in zoom-in-95 duration-200"
                    >
                        {isLoading ? (
                            <div className="flex items-center gap-3">
                                <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                                <p className="text-sm font-black dark:text-white uppercase tracking-widest">Translating...</p>
                            </div>
                        ) : notFound ? (
                            <p className="text-sm font-bold text-red-500">❌ Character not found. We'll add it soon!</p>
                        ) : (
                            <div className="space-y-4">
                                <div>
                                    <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 dark:text-gray-500 mb-1">Character</p>
                                    <p className="text-4xl font-black text-gray-900 dark:text-white">{word}</p>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 dark:text-gray-500">Pinyin</p>
                                        <p className="text-lg font-bold text-blue-600 dark:text-blue-400">{pinyin}</p>
                                    </div>
                                    <div>
                                        <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 dark:text-gray-500">Type</p>
                                        <p className="text-sm font-bold dark:text-gray-200">{partOfSpeech}</p>
                                    </div>
                                </div>
                                <div>
                                    <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 dark:text-gray-500">Definition</p>
                                    <p className="font-bold text-gray-700 dark:text-gray-300 italic">{translation}</p>
                                </div>
                                <button
                                    onClick={handleAddToStudySet}
                                    className="w-full bg-gray-900 dark:bg-white text-white dark:text-gray-900 font-black py-2.5 rounded-xl border-2 border-transparent hover:bg-blue-600 dark:hover:bg-blue-400 transition-all text-sm uppercase tracking-wider"
                                >
                                    + Add to Deck
                                </button>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </>
    );
}

WordHover.propTypes = {
    word: PropTypes.string.isRequired,
};

export default WordHover;
