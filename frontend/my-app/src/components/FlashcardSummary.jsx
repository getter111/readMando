import PropTypes from "prop-types";

export default function FlashcardSummary({ correct, incorrect, onRepeatAll, onRepeatMistakes, onFinish }) {
  return (
    <div className={`relative text-center fade-up`}>
      <div className="summary-background-text">🥳🥳🥳🥳🥳🥳🥳🥳🥳🥳</div>
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">Session Summary :^)</h2>
        <p className="text-lg text-green-600">✅ Correct: {correct}</p>
        <p className="text-lg text-red-600">❌ Incorrect: {incorrect}</p>

        <div className="flex flex-wrap justify-center gap-4 mt-6">
          <button
            onClick={onRepeatAll}
            className="bg-blue-600 text-white px-4 py-2 rounded transition hover:bg-blue-700 cursor-pointer"
            aria-label={`Repeat all flashcards again`}
          >
            Repeat All Cards
          </button>

          {incorrect > 0 && (
            <button
              onClick={onRepeatMistakes}
              className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 transition cursor-pointer"
              aria-label={`Repeat flashcard mistakes only again`}
            >
              Repeat Mistakes Only
            </button>
          )}

          <button
            onClick={onFinish}
            className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 transition cursor-pointer"
            aria-label={`Finished studying flashcards button`}
          >
            Finish
          </button>
        </div>
      </div>
    </div>
  
  );
}

FlashcardSummary.propTypes = {
  correct: PropTypes.number.isRequired,
  incorrect: PropTypes.number.isRequired,
  onRepeatAll: PropTypes.func.isRequired,
  onRepeatMistakes: PropTypes.func.isRequired,
  onFinish: PropTypes.func.isRequired,
};
