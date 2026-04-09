import { useEffect } from "react";
import PropTypes from "prop-types";

function ToastNotification({ message, onClose, duration = 2000 }) {
    useEffect(() => {
        const timer = setTimeout(onClose, duration);
        return () => clearTimeout(timer);
    }, [onClose, duration]);

    return (
        <div className="fixed top-24 left-1/2 transform -translate-x-1/2 z-[100] animate-in fade-in slide-in-from-top-4 duration-300">
            <div className="bg-gray-900 dark:bg-white text-white dark:text-gray-900 px-6 py-3 rounded-2xl border-2 border-white dark:border-gray-900 shadow-2xl font-black text-sm uppercase tracking-widest flex items-center gap-3">
                <span className="text-xl">✨</span>
                {message}
            </div>
        </div>
    );
}

ToastNotification.propTypes = {
    message: PropTypes.string.isRequired,
    onClose: PropTypes.func.isRequired,
    duration: PropTypes.number,
};

export default ToastNotification;
