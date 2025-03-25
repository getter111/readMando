import WordHover from "./WordHover";
import PropTypes from "prop-types";

function StoryDisplay({ story }) {
    if (!story.content) return <p className="text-gray-500">No story generated yet.</p>;

    // Split story content into words and wrap them with WordHover
    const words = story.content.split(/\s+/).map((word, index) => (
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
