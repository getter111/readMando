import WordHover from "./WordHover";
import PropTypes from "prop-types";

function StoryDisplay({ story }) {

    //segment story.content into individual vocabulary using jieba library.
    if (!story.content || !Array.isArray(story.content)) 
        return <p className="text-gray-500">No story generated yet.</p>;

    // Map segmented words into hoverable elements
    const words = story.content.map((word, index) => (
        <WordHover key={index} word={word} />
    ));


    return (
        <div>
            <h3 className="text-lg font-bold">{story.title}</h3>
            <p className="mt-2">{words}</p>
        </div>
    );
}

StoryDisplay.propTypes = {
    story: PropTypes.string.isRequired
};

export default StoryDisplay;
