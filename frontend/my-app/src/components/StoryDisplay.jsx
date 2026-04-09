import WordHover from "./WordHover";
import PropTypes from "prop-types";

// Regex for English and Chinese punctuation
const punctuationRegex = /^[.,!?;:(){}[\]'"`-。，！？；：“”【】()、\s\n\r]+$/;

// Regex for Chinese Characters
const chineseRegex = /^[\u4e00-\u9fff]+$/;

//passing in the segmented array of story content
function StoryDisplay({ story, fetchQuestions, loadingQuestions }) {  
    if (!story.content || !story.title) 
        return <p className="text-gray-500 flex-auto">No story generated yet.</p>;

    const renderSegment = (segment, type = "body") => {
        return segment.map((word, index) => {
            const key = `${type}-${index}`;
            return punctuationRegex.test(word) || !chineseRegex.test(word)
                ? <span key={key} className="dark:text-gray-400">{word}</span> // render punctuation or english word as non-hoverable
                : <WordHover key={key} word={word} />;
        });
    };

    const title = Array.isArray(story.title)
        ? renderSegment(story.title, "title")
        : story.title;

    const body = Array.isArray(story.content)
        ? renderSegment(story.content, "body")
        : story.content;

    return (
        <div className="flex flex-col h-full">
            <div className="flex-grow">
                <h3 className="text-3xl font-black flex flex-wrap leading-tight text-gray-900 dark:text-white">
                    {title}
                </h3>
                <div className="mt-8 text-2xl flex flex-wrap leading-relaxed text-gray-800 dark:text-gray-200">
                    {body}
                </div>
            </div>

            <div className="mt-12">
                <button
                    onClick={fetchQuestions}
                    disabled={loadingQuestions}
                    className={`
                        w-full py-4 rounded-2xl font-black text-lg transition-all
                        ${loadingQuestions 
                            ? 'bg-gray-200 text-gray-400 cursor-not-allowed' 
                            : 'bg-green-500 text-white border-4 border-gray-900 dark:border-white/10 shadow-[4px_4px_0_0_rgba(0,0,0,1)] dark:shadow-[4px_4px_0_0_rgba(255,255,255,0.1)] hover:translate-y-[-2px] hover:shadow-[6px_6px_0_0_rgba(0,0,0,1)] active:translate-y-[1px] active:shadow-none cursor-pointer'
                        }
                    `}
                >
                    {loadingQuestions ? "✨ Thinking..." : "🤔 Test My Knowledge"}
                </button>
            </div>
        </div>
    );
}

StoryDisplay.propTypes = {
    story: PropTypes.shape({
        title: PropTypes.arrayOf(PropTypes.string).isRequired,
        content: PropTypes.arrayOf(PropTypes.string).isRequired,
    }).isRequired,
    fetchQuestions: PropTypes.func.isRequired,
    loadingQuestions: PropTypes.bool.isRequired,
};

export default StoryDisplay;
