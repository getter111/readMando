import PropTypes from "prop-types";

export default function FlashcardSummary({ correct, incorrect, onRepeatAll, onRepeatMistakes, onFinish }) {
  return (
    <div className="relative flex flex-col items-center justify-center p-6 fade-up">

      <div className="bg-white rounded-2xl shadow-xl max-w-lg w-full z-10 p-8 flex flex-col items-center text-center space-y-4">
        <h2 className="text-3xl font-extrabold text-gray-800">🎉 Session Summary 🎉</h2>

        <div className="flex flex-col sm:flex-row justify-center items-center gap-4 text-xl font-semibold">
          <div className="text-green-600 flex items-center gap-2">
            ✅ Correct: <span>{correct}</span>
          </div>
          <div className="text-red-600 flex items-center gap-2">
            ❌ Incorrect: <span>{incorrect}</span>
          </div>
        </div>

        <div className="flex flex-wrap justify-center gap-4 mt-6 pt-4">
          <button
            onClick={onRepeatAll}
            className="bg-blue-600 flex-auto text-white px-4 py-2 text-lg font-bold rounded-lg shadow transition hover:bg-blue-700 cursor-pointer"
            aria-label={`Repeat all flashcards again`}
          >
            Repeat All Cards
          </button>

          {incorrect > 0 && (
            <button
              onClick={onRepeatMistakes}
              className="bg-red-600 flex-auto text-white text-lg font-bold px-4 py-2 hover:bg-red-700 rounded-lg shadow transition cursor-pointer"
              aria-label={`Repeat flashcard mistakes only again`}
            >
              Repeat Mistakes Only
            </button>
          )}

          <button
            onClick={onFinish}
            className="bg-green-600 flex-auto text-white text-lg font-bold px-4 py-2 hover:bg-green-700 rounded-lg shadow transition cursor-pointer"
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
