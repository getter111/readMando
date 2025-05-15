import { useState } from "react";
import PropTypes from "prop-types";
import axios from 'axios';

//pass in from netlify
const apiUrl = import.meta.env.VITE_API_BASE_URL;

const translationCache = new Map();

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

    async function fetchTranslation() {
        //check in memory cache first
        if (translationCache.has(word)) {
            try {
                const cached = translationCache.get(word); //get from memory
                console.log(`⚡ Using cached data for ${word}`);
                setState(cached)
                return;
            } catch (err) {
                console.error(`Failed to get from cache for: ${word}. ${err}`);            
            }
        }
        const localData = localStorage.getItem(localKey) //get from local storage
        if (localData){
            try {
                const cached = JSON.parse(localData) 
                console.log(`💾 localStorage for ${word}`);
                translationCache.set(word, cached) //cache
                setState(cached)
                return;
            } catch (err) {
                console.error(`Failed to parse localStorage for: ${word}. ${err}`);            }
        }
        //fetch unknown word from api
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
                translationCache.set(word, definition) //cache result
                localStorage.setItem(localKey,JSON.stringify(definition)) //store in browser local storage
                setState(definition)
                setIsLoading(false);
                console.log(`✅ Translation:`, definition);
            }  
        } catch (error) { //gets a 404 status from api response
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

                    translationCache.set(word, definition) //cache result
                    localStorage.setItem(localKey,JSON.stringify(definition)) //store in browser local storage
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
