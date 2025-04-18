import { useState } from "react";
import PropTypes from "prop-types";
import axios from 'axios';

const apiUrl = import.meta.env.VITE_API_BASE_URL;

function WordHover({ word }) {
    const [translation, setTranslation] = useState("");
    const [pinyin, setPinyin] = useState("");
    const [notFound, setNotFound] = useState(false);
    const [showTooltip, setShowTooltip] = useState(false);
    const [highlight, setHighlight] = useState("");
    const [partOfSpeech, setPartOfSpeech] = useState("")

    async function fetchTranslation() {
        try {
            const response = await axios.get(`${apiUrl}/vocabulary/${word}`);
            if (!response.data.statusCode) { 
                const data = response.data;
                setTranslation(data.translation);
                setPinyin(data.pinyin);
                setPartOfSpeech(data.word_type);
                setNotFound(false);
                console.log(response)
            } else {
                setNotFound(true);
                console.error("word not found" , response);

            }
        } catch (error) {
            console.error(`Error fetching ${word}`, error);
            setNotFound(true);
            setHighlight("not-found");
        }
    }

    const handleMouseEnter = () => {
        fetchTranslation(); // Check if the word exists on hover\
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
        <span
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave} 
            className={`relative border-b border-dotted cursor-pointer transition ${
                highlight === "found" ? "bg-green-200" : highlight === "not-found" ? "bg-red-200" : "hover:bg-yellow-200"
            }`}
        >
            {word}
            {showTooltip && (translation || pinyin || notFound) && (
                <span className="absolute left-0 mt-2 w-48 bg-white p-2 border rounded shadow-lg z-10">
                    {notFound ? <p>Word: {word} not found!</p> : 
                        <>
                            {word && <p>Word: {word}</p>}
                            {translation && <p>Translation: {translation}</p>}
                            {pinyin && <p>Pinyin: {pinyin}</p>}
                            {partOfSpeech && <p>Part of Speech: {partOfSpeech}</p>}
                        </>
                    }
                </span>
            )}
        </span>
    );
}

WordHover.propTypes = {
    word: PropTypes.string.isRequired,
};

export default WordHover;
