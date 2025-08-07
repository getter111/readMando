import PropTypes from "prop-types";
import axios from "axios";
export default function Flashcard({ dictionary, onFeedback, flipped, setFlipped}) {
    const apiUrl = import.meta.env.VITE_API_BASE_URL;

    const handleFlip = () => setFlipped((prev) => !prev);

    const handleAudio = async (e) => {
        try {
            e.stopPropagation(); // Prevent flipping
            const res = await axios(`${apiUrl}/study_deck/tts?word=${encodeURIComponent(dictionary.word)}`)
            const audio = new Audio(res.data.url)
            await audio.play();
        } catch (err) {
            console.error("Audio play failed:", err);     
        }
    };

    const handleFeedback = (e, type) => {
        e.stopPropagation();
        onFeedback && onFeedback(type, dictionary);
    }

    return (
        <div
            className="w-72 h-44 sm:w-80 sm:h-52 md:w-[350px] md:h-[220px] lg:w-[400px] lg:h-[250px] cursor-pointer"
            onClick={() => handleFlip()}
        >

        {!flipped ? ( 
            <>
                {/* Front */}
                <div className="bg-white border rounded-xl shadow p-6 flex flex-col justify-around w-full h-full hover:shadow-lg transition items-center">
                    <div className="flex flex-col items-center text-center">
                        <p className="text-3xl font-extrabold text-gray-900 ">{dictionary.word}</p>
                        <p className="text-xl text-gray-700 mt-1">{dictionary.pinyin}</p>
                        
                        <button
                            onClick={(e) => handleAudio(e)}
                            className="mt-3 text-xl hover:bg-yellow-200 p-2 transition cursor-pointer rounded-full"
                            aria-label={`Play audio of ${dictionary.translation}`}
                        >
                            🔊
                        </button>
                    </div>
                    <p className="text-sm text-gray-400 mt-3 select-none">Tap to see translation</p>
                </div> 
            </>
        ) :
        (
            <>
                {/* Back */}
                <div className="bg-gray-50 border rounded-xl shadow p-6 flex flex-col justify-around items-center content-start hover:shadow-lg transition w-full h-full">
                    <div className="flex flex-col items-center text-center">
                        <p className="text-2xl font-extrabold text-gray-900">{dictionary.translation}</p>
                        <p className="text-xl text-gray-700 mt-1">[{dictionary.word_type}]</p>
                    </div>

                    <div className="flex justify-between gap-2 mt-4 ">
                        <button
                            onClick={(e) => handleFeedback(e, "again")}
                            className="bg-red-200 text-red-800 text-lg font-bold px-4 py-2 rounded-md hover:bg-red-300 transition cursor-pointer"
                            aria-label={`${dictionary.word} was difficult study again`}

                        >
                            Again
                        </button>

                        <button
                            onClick={(e) => handleFeedback(e, "good")}
                            className="bg-yellow-200 text-yellow-800 text-lg font-bold px-4 py-2 rounded hover:bg-yellow-300 transition cursor-pointer"
                            aria-label={`I knew ${dictionary.word} it was good`}

                        >
                            Good
                        </button>

                        <button
                            onClick={(e) => handleFeedback(e, "easy")}
                            className="bg-green-200 text-green-800 text-lg font-bold px-4 py-2 rounded hover:bg-green-300 transition cursor-pointer"
                            aria-label={`I knew ${dictionary.word} it was easy`}

                        >
                            Easy
                        </button>
                    </div>
                </div>
            </>
        )}
    </div>
  );
}

Flashcard.propTypes = {
  dictionary: PropTypes.shape({
    word: PropTypes.string.isRequired,
    pinyin: PropTypes.string,
    translation: PropTypes.string,
    word_type: PropTypes.string,
  }),
  onFeedback: PropTypes.func,
  flipped: PropTypes.bool,
  setFlipped: PropTypes.func
};
