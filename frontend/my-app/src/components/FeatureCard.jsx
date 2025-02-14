import PropTypes from "prop-types";

export default function FeatureCard({ image, title, buttonText, onClick }) {
  return (
    <div className="bg-white shadow-md rounded-lg text-center p-6">
      <img src={image} alt={title} className="w-24 h-24 mx-auto mb-4" />
      <h2 className="text-xl font-bold mb-2">{title}</h2>
      <button className="bg-blue-500 text-white px-4 py-2 hover:bg-blue-600 transitionrounded-md cursor-pointer" onClick={onClick}>
        {buttonText}
      </button>
    </div>
  );
}

FeatureCard.propTypes = {
  image: PropTypes.object.isRequired, 
  title: PropTypes.string.isRequired,
  buttonText: PropTypes.string.isRequired,
  onClick: PropTypes.func.isRequired,
};
