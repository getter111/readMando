import { useState, useRef, useEffect } from "react";
import PropTypes from "prop-types";
import axios from 'axios';
import ToastNotification from "./ToastNotification";

//pass in from netlify
const apiUrl = import.meta.env.VITE_API_BASE_URL;

function WordHover({ word }) {
    const [translation, setTranslation] = useState("");
    const [pinyin, setPinyin] = useState("");
    const [partOfSpeech, setPartOfSpeech] = useState("")

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
            console.log(`💾 Used localStorage for ${word}`);
            setState(JSON.parse(localValue));
            return;
        }

        //fetch word from backend
        setIsLoading(true);
        try {
            console.log(`🔍 Fetching translation for: ${word}`);
            const response = await axios.get(`${apiUrl}/vocabulary/${word}`);
            
            //if there's a status code then it means its ggs, since it returns a 404 status code
            if (!response.data.statusCode) { 
                const definition = {
                    word: response.data.word,
                    translation: response.data.translation,
                    pinyin: response.data.pinyin,
                    wordType: response.data.word_type,
                }
                localStorage.setItem(localKey, JSON.stringify(definition));
                setState(definition)
                // console.log(response)
            }  
        } catch (error) {
            //404 return from /vocabulary/{word}, so we auto-fetch unknown word from backend
            if (axios.isAxiosError(error) && error.response?.status === 404) {
                console.log(`${error}, ${word} not found. auto generating...`);
                setNotFound(true);
                setHighlight("not-found");

                try {
                    const newWord = await axios.post(`${apiUrl}/vocabulary`, {
                        vocab: word
                    });

                    const definition = {
                        word: newWord.data.word,
                        translation: newWord.data.translation,
                        pinyin: newWord.data.pinyin,
                        wordType: newWord.data.word_type,
                    }

                    localStorage.setItem(localKey, JSON.stringify(definition));
                    setState(definition)
                    setHighlight("found");
                } catch (autoFetchError) {
                    console.error(`❌ auto-fetch API ${autoFetchError}`);
                    setNotFound(true);
                }
            } else {
                console.error(`Error in fetchTranslation()? ${error}`);
                setNotFound(true);
            }
        } finally {
            setIsLoading(false)
        }
    }   

    const toggleTooltip = () => {
        const nextState = !showTooltip;
        setShowTooltip(nextState);
        setHighlight(nextState ? "found" : "");

        if (nextState) {
            fetchTranslation();
        }
    };

    const handleClickOutside = (e) => {
        //if user clicks an element outside this toolkit
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
            await axios.post(`${apiUrl}/users/study_deck`, {
                word: word, 
            }, { withCredentials: true });
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
    <>
        {toastMsg && (
            <ToastNotification message={toastMsg} onClose={() => setToastMsg("")} duration={3000} />
        )}
        <div
            className="relative inline-block"
        >
            <span
                onClick={toggleTooltip}
                className={`border-b border-dotted cursor-pointer transition ${
                    highlight === "found"
                        ? "bg-green-200"
                        : highlight === "not-found"
                        ? "bg-yellow-200"
                        : "hover:bg-yellow-200 transition"
                }`}
            >
                {word}
            </span>
            {showTooltip && (
                <div
                    ref={tooltipRef}
                    className="fixed sm:absolute bottom-0 sm:bottom-full left-0 sm:left-1/2 sm:-translate-x-1/2 w-full sm:w-max max-w-xs bg-white text-base text-black p-4 sm:rounded-xl rounded-t-xl shadow-lg z-50 whitespace-normal pointer-events-auto max-h-60 sm:max-h-60 overflow-y-auto"
                >
                    {isLoading ? (
                        <p className="text-gray-400">⏳ Loading...</p>
                    ) : notFound ? (
                        <p className="font-medium">❌ Word not found. Hang tight — generating it now...</p>
                    ) : (
                        <>
                            <p className="font-bold">
                                <span>Word: </span>
                                <span>{word}</span>
                            </p>
                            {pinyin && (
                                <p className="font-semibold">
                                    <span>Pinyin: </span>
                                    <span>{pinyin}</span>
                                </p>
                            )}
                            {translation && (
                                <p className="font-semibold">
                                    <span>Translation: </span>
                                    <span>{translation}</span>

                                </p>
                            )}
                            {partOfSpeech && (
                                <p className="font-semibold">
                                    <span>Part of Speech: </span>
                                    <span>{partOfSpeech}</span>
                                </p>
                            )}
                            <button
                                onClick={handleAddToStudySet}
                                className="mt-2 bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded-xl text-base cursor-pointer w-full sm:w-auto"
                                aria-label={`Add ${translation} to study deck button`}
                            >
                                Add to Study Set
                            </button>
                        </>
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
