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
                ? <span key={key}>{word}</span> // render punctuation or english word as non-hoverable
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
                <h3 className="text-2xl font-bold flex flex-wrap">{title}</h3>
                <div className="mt-4 text-lg flex flex-wrap">{body}</div>
            </div>

            <div className="mt-6 flex flex-col gap-3">
                <button
                    onClick={fetchQuestions}
                    disabled={loadingQuestions}
                    className="w-full bg-blue-500 text-white p-2 rounded hover:bg-blue-600 transition disabled:bg-gray-400 cursor-pointer"
                    aria-label={`Generate Questions button`}
                >
                    {loadingQuestions ? "Generating Questions..." : "Generate Questions"}
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
    clearStory: PropTypes.func.isRequired,
};

export default StoryDisplay;
