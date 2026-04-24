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

    const sideStyle = `
        bg-white dark:bg-gray-800 border-4 border-gray-900 dark:border-white/10 rounded-3xl
        shadow-[8px_8px_0_0_rgba(0,0,0,1)] dark:shadow-[8px_8px_0_0_rgba(255,255,255,0.05)]
        p-8 flex flex-col justify-between items-center w-full h-full
        transition-all duration-300 transform
    `;

    return (
        <div
            className="w-full max-w-sm aspect-[3/2] cursor-pointer perspective-1000"
            onClick={handleFlip}
        >
            {!flipped ? ( 
                <div className={`${sideStyle} hover:translate-y-[-4px]`}>
                    <div className="flex flex-col items-center text-center mt-4">
                        <p className="text-5xl font-black text-gray-900 dark:text-white mb-2">{dictionary.word}</p>
                        <p className="text-xl font-bold text-blue-600 dark:text-blue-400">{dictionary.pinyin}</p>
                        
                        <button
                            onClick={handleAudio}
                            className="mt-6 p-4 bg-yellow-100 dark:bg-yellow-900/30 rounded-2xl hover:scale-110 active:scale-95 transition-all cursor-pointer"
                        >
                            🔊
                        </button>
                    </div>
                    <p className="text-xs font-black uppercase tracking-widest text-gray-400 animate-pulse">Tap to reveal</p>
                </div> 
            ) : (
                <div className={`${sideStyle} bg-gray-50 dark:bg-gray-900`}>
                    <div className="flex flex-col items-center text-center">
                        <p className="text-3xl font-black text-gray-900 dark:text-white mb-1">{dictionary.translation}</p>
                        <span className="px-2 py-0.5 rounded bg-gray-200 dark:bg-gray-700 text-[10px] font-black uppercase tracking-widest text-gray-500">
                            {dictionary.word_type}
                        </span>
                    </div>

                    <div className="grid grid-cols-3 gap-3 w-full mt-8">
                        <button
                            onClick={(e) => handleFeedback(e, "again")}
                            className="bg-red-500 text-white font-black py-3 rounded-xl border-2 border-gray-900 shadow-[2px_2px_0_0_rgba(0,0,0,1)] hover:translate-y-[-1px] active:translate-y-[1px] active:shadow-none transition-all text-xs uppercase cursor-pointer"
                        >
                            Again
                        </button>

                        <button
                            onClick={(e) => handleFeedback(e, "good")}
                            className="bg-yellow-400 text-gray-900 font-black py-3 rounded-xl border-2 border-gray-900 shadow-[2px_2px_0_0_rgba(0,0,0,1)] hover:translate-y-[-1px] active:translate-y-[1px] active:shadow-none transition-all text-xs uppercase cursor-pointer"
                        >
                            Good
                        </button>

                        <button
                            onClick={(e) => handleFeedback(e, "easy")}
                            className="bg-green-500 text-white font-black py-3 rounded-xl border-2 border-gray-900 shadow-[2px_2px_0_0_rgba(0,0,0,1)] hover:translate-y-[-1px] active:translate-y-[1px] active:shadow-none transition-all text-xs uppercase cursor-pointer"
                        >
                            Easy
                        </button>
                    </div>
                </div>
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
