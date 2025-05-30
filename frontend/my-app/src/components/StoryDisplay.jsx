import WordHover from "./WordHover";
import PropTypes from "prop-types";

// Regex for English and Chinese punctuation
const punctuationRegex = /^[.,!?;:(){}[\]'"`-。，！？；：“”【】()、\s\n\r]+$/;

// Regex for Chinese Characters
const chineseRegex = /^[\u4e00-\u9fff]+$/;

//passing in the segmented array of story content
function StoryDisplay({ story }) {
    if (!story.content || !Array.isArray(story.content)) 
        return <p className="text-gray-500">No story generated yet.</p>;

    const renderSegment = (segment, type = "body") => {
        return segment.map((word, index) => {
            const key = `${type}-${index}`;
            return punctuationRegex.test(word) || !chineseRegex.test(word)
                ? <span key={key}>{word}</span> // render punctuation or english word as non-hoverable
                : <WordHover key={key} word={word} />;
        });
    };
    const title = renderSegment(story.title, "title");
    const body = renderSegment(story.content, "body");

    return (
        <div>
            <h3 className="text-lg font-bold flex flex-wrap">{title}</h3>
            <div className="mt-2 flex flex-wrap">{body}</div>
        </div>
    );
}

StoryDisplay.propTypes = {
    story: PropTypes.shape({
        title: PropTypes.arrayOf(PropTypes.string).isRequired,
        content: PropTypes.arrayOf(PropTypes.string).isRequired,
    }).isRequired,
};

export default StoryDisplay;
