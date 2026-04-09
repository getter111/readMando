import PropTypes from "prop-types";

export default function VocabCard({ card, onPlayAudio, onHeartClick }) {
    return (
        <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl border-4 border-gray-900 dark:border-white/10 shadow-[4px_4px_0_0_rgba(0,0,0,1)] dark:shadow-[4px_4px_0_0_rgba(255,255,255,0.05)] transition-all hover:translate-y-[-2px] hover:shadow-[6px_6px_0_0_rgba(0,0,0,1)] dark:hover:shadow-[6px_6px_0_0_rgba(255,255,255,0.1)] flex justify-between items-start flex-grow min-w-[280px] max-w-sm group">

            <div className="space-y-2">
                <p className="text-4xl font-black text-gray-900 dark:text-white transition-transform group-hover:scale-105 origin-left">
                    {card.word}
                </p>
                <div>
                    <p className="text-sm font-black uppercase tracking-widest text-blue-600 dark:text-blue-400">
                        {card.pinyin}
                    </p>
                    <p className="text-gray-600 dark:text-gray-400 font-medium">
                        {card.translation}
                    </p>
                </div>
                <span className="inline-block px-2 py-0.5 rounded bg-gray-100 dark:bg-gray-700 text-[10px] font-black uppercase tracking-widest text-gray-400">
                    {card.word_type}
                </span>
            </div>

            <div className="flex flex-col gap-2">
                <button
                    className="p-3 bg-yellow-100 dark:bg-yellow-900/30 rounded-xl border-2 border-transparent hover:border-gray-900 dark:hover:border-yellow-500 transition-all cursor-pointer"
                    onClick={() => onPlayAudio(card.word)}
                    title="Play Audio"
                >
                    🔊
                </button>

                <button
                    className={`p-3 rounded-xl border-2 border-transparent transition-all cursor-pointer ${
                        card.is_active 
                        ? "bg-pink-100 dark:bg-pink-900/30 hover:border-pink-500" 
                        : "bg-gray-50 dark:bg-gray-700/50 hover:border-gray-400"
                    }`}
                    onClick={() => onHeartClick(card.user_vocab_id, card.word)}
                    title={card.is_active ? "Remove from deck" : "Add to deck"}
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
