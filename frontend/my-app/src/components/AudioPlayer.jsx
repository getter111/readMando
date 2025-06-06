import PropTypes from "prop-types";

export default function AudioPlayer({ audioUrl }) {
    return (
        <audio controls className="w-64 my-4 rounded border border-gray-300 shadow-md">
            <source src={audioUrl} type="audio/wav" />
        </audio>
    );
  }

  AudioPlayer.propTypes = {
    audioUrl: PropTypes.string.isRequired, 
  };