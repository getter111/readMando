import { useEffect } from "react";
import PropTypes from "prop-types";

function ToastNotification({ message, onClose, duration = 2000 }) {
    useEffect(() => {
        const timer = setTimeout(onClose, duration);
        return () => clearTimeout(timer);
    }, [onClose, duration]);

    return (
        <div className="fixed top-4 left-1/2 transform -translate-x-1/2 bg-black text-white px-4 py-2 rounded-lg shadow-lg z-[9999] text-center">
            {message}
        </div>
    );
}

ToastNotification.propTypes = {
    message: PropTypes.string.isRequired,
    onClose: PropTypes.func.isRequired,
    duration: PropTypes.number,
};


export default ToastNotification;

