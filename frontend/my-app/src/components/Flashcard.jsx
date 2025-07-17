import PropTypes from "prop-types";

export default function Flashcard({ dictionary, onFeedback, flipped, setFlipped}) {
  const handleFlip = () => setFlipped((prev) => !prev);

  return (
    <div
      className="w-72 h-44 sm:w-80 sm:h-52 md:w-[350px] md:h-[220px] lg:w-[400px] lg:h-[250px] cursor-pointer"
      onClick={handleFlip}
    >
 
        {!flipped ? ( 
            <>
                {/* Front */}
                <div className="bg-white border rounded-xl shadow p-4 flex flex-col justify-between w-full h-full">
                <div>
                    <p className="text-2xl font-bold">{dictionary.word}</p>
                    <p className="text-gray-700">{dictionary.pinyin}</p>
                    
                    <button
                        onClick={(e) => {
                            e.stopPropagation(); // Prevent flipping
                        }}
                        className="mt-2 text-lg hover:bg-yellow-300 transition cursor-pointer rounded "
                        aria-label={`Play audio of ${dictionary.translation}`}
                    >
                        🔊
                    </button>
                    <button className="mt-2 text-lg ml-1 cursor-pointer hover:bg-pink-300 transition rounded "
                            onClick={(e) => {
                                e.stopPropagation();
                            }}
                            aria-label={`Add word ${dictionary.translation} your study deck`}
                    >
                        ❤️
                    </button>

                </div>
                <p className="text-xs text-gray-400 mt-2">Tap to see translation</p>
                </div> 
            </>
        ) :
        (
            <>
                {/* Back */}
                <div className="bg-gray-50 border rounded-xl shadow p-4 flex flex-col justify-between w-full h-full">
                <div>
                    <p className="text-xl font-medium">{dictionary.translation}</p>
                    <p className="text-sm text-gray-500 mt-1">[{dictionary.word_type}]</p>
                </div>
                <div className="flex justify-between gap-2 mt-4">
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            onFeedback && onFeedback("again", dictionary);
                        }}
                        className="bg-red-100 text-red-700 px-3 py-1 rounded hover:bg-red-200 transition cursor-pointer"
                        aria-label={`${dictionary.word} was difficult study again`}

                    >
                    Again
                    </button>

                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            onFeedback && onFeedback("good", dictionary);
                        }}
                        className="bg-yellow-100 text-yellow-700 px-3 py-1 rounded hover:bg-yellow-200 transition cursor-pointer"
                        aria-label={`I knew ${dictionary.word} it was good`}

                    >
                    Good
                    </button>

                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            onFeedback && onFeedback("easy", dictionary);
                        }}
                        className="bg-green-100 text-green-700 px-3 py-1 rounded hover:bg-green-200 transition cursor-pointer"
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
