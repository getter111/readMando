import { useState } from "react";
import PropTypes from "prop-types";
import axios from 'axios';

//pass in from netlify
const apiUrl = import.meta.env.VITE_API_BASE_URL;
const TTL = 7 * 24 * 60 * 60 * 1000; 

function WordHover({ word }) {
    const [translation, setTranslation] = useState("");
    const [pinyin, setPinyin] = useState("");
    const [partOfSpeech, setPartOfSpeech] = useState("")

    const [isLoading, setIsLoading] = useState(false);
    const [notFound, setNotFound] = useState(false);
    const [showTooltip, setShowTooltip] = useState(false);
    const [highlight, setHighlight] = useState("");

    const localKey = `word:${word}`; //key for localstorage
    
    function setState(definition){
        setTranslation(definition.translation);
        setPinyin(definition.pinyin);
        setPartOfSpeech(definition.wordType);
        setNotFound(false);
    }

    // add value and custom expiration time to local storage (in ms)
    function setExpireDate(key, value, ttl) {
        const now = new Date();
        const item = {
            value: value,
            expiry: now.getTime() + ttl,
        };
        localStorage.setItem(key, JSON.stringify(item));
    }

    // Gets item if not expired
    function getLocalStorage(key) {
        const itemStr = localStorage.getItem(key);
        if (!itemStr) return null;

        try {
            const item = JSON.parse(itemStr); //oonverts string to a dictionary
            const now = new Date();

            if (now.getTime() > item.expiry) {
                localStorage.removeItem(key); //remove expired item
                return null;
            }
            return item.value;
        } catch (e) {
            console.error("Failed to parse item from localStorage", e);
            localStorage.removeItem(key);
            return null;
        }
    }

    async function fetchTranslation() {
        const localValue = getLocalStorage(localKey);
        if (localValue) {
            console.log(`💾 Used localStorage for ${word}`);
            setState(localValue);
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

                setExpireDate(localKey, definition, TTL); //store definition in browsers local storage
                setState(definition)
                setIsLoading(false);
                console.log(`✅ Translation:`, definition);
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

                    setExpireDate(localKey, definition, TTL);
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

    const handleMouseEnter = () => {
        fetchTranslation(); // Check if the word exists on hover
        setShowTooltip(true);
        
        if(!notFound){
            setHighlight("found"); 
        } else{
            setHighlight("not-found"); 
        }
    };

    const handleMouseLeave = () => {
        setShowTooltip(false);
        setHighlight("");
    };

return (
    <div
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        className="relative inline-block"
    >
        <span
            className={`border-b border-dotted cursor-pointer transition ${
                highlight === "found"
                    ? "bg-green-200"
                    : highlight === "not-found"
                    ? "bg-red-200"
                    : "hover:bg-yellow-200"
            }`}
        >
            {word}
        </span>
        {showTooltip && (
            <div
                className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 w-max max-w-xs bg-white text-sm text-black p-3 rounded-lg shadow-lg z-50 whitespace-normal pointer-events-auto"
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
                    </>
                )}
            </div>
        )}
    </div>
);

}

WordHover.propTypes = {
    word: PropTypes.string.isRequired,
};

export default WordHover;
