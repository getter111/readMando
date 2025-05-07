import PropTypes from "prop-types";

export default function AudioPlayer({ audioUrl }) {
    return (
        <audio controls>
            <source src={audioUrl} type="audio/wav" />
        </audio>
    );
  }

  AudioPlayer.propTypes = {
    audioUrl: PropTypes.string.isRequired, 
  };