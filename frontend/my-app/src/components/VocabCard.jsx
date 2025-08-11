import PropTypes from "prop-types";

export default function VocabCard({ card, onPlayAudio, onHeartClick }) {
    return (
        <div className="bg-white p-6 rounded-2xl shadow-md flex justify-between items-start flex-grow min-w-[250px] max-w-sm transition hover:shadow-lg">

            <div className="mb-4 space-y-1">
                <p className="text-2xl font-extrabold text-black break-words">{card.word}</p>
                <p className="text-lg text-gray-700 break-words">{card.pinyin}</p>
                <p className="text-gray-500 break-words">
                    {card.translation} ({card.word_type})
                </p>
            </div>

            <div className="flex items-center gap-3 text-lg">
                <button
                    className="p-2 cursor-pointer hover:bg-yellow-200 transition rounded-full"
                    aria-label={`Play audio for ${card.translation} button`}
                    onClick={() => onPlayAudio(card.word)}
                >
                    🔊
                </button>

                <button
                    className="p-2 cursor-pointer hover:bg-pink-200 transition rounded-full"
                    aria-label={`Add/unadd word: ${card.translation} to study deck button`}
                    onClick={() => onHeartClick(card.user_vocab_id, card.word)}
                >
                    {card.is_active ? "❤️" : "🤍"}
                </button>
            </div>
        </div>
    );
}

VocabCard.propTypes = {
    card: PropTypes.shape({
        word: PropTypes.string.isRequired,
        pinyin: PropTypes.string,
        translation: PropTypes.string,
        word_type: PropTypes.string,
        user_vocab_id: PropTypes.number,
        is_active: PropTypes.bool,
    }).isRequired,
    onPlayAudio: PropTypes.func.isRequired,
    onHeartClick: PropTypes.func.isRequired,
};
