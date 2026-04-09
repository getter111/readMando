import { useState } from "react";
import PropTypes from "prop-types";

export default function SearchBar({ placeholder = "Search...", value, onChange, onKeyDown }) {
  const [isFocused, setIsFocused] = useState(false);

  return (
    <div className="relative w-full group">
      <div className={`
        absolute inset-0 bg-blue-600 dark:bg-blue-500 rounded-xl transition-all duration-300
        ${isFocused ? 'scale-105 blur-sm opacity-20' : 'opacity-0'}
      `}></div>
      
      <div className={`
        relative flex items-center bg-white dark:bg-gray-800 border-2 rounded-xl transition-all duration-200
        ${isFocused 
          ? 'border-gray-900 dark:border-white shadow-[4px_4px_0_0_rgba(0,0,0,1)] dark:shadow-[4px_4px_0_0_rgba(255,255,255,0.1)] -translate-y-0.5' 
          : 'border-gray-200 dark:border-gray-700'
        }
      `}>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={3}
          stroke="currentColor"
          className={`ml-4 w-5 h-5 transition-colors duration-200 pointer-events-none 
            ${isFocused ? 'text-blue-600 dark:text-blue-400' : 'text-gray-400'}`}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z"
          />
        </svg>

        <input
          type="text"
          placeholder={placeholder}
          className="w-full pl-3 pr-4 py-2.5 bg-transparent text-sm font-bold text-gray-900 dark:text-white placeholder-gray-400 outline-none"
          value={value}
          onChange={onChange}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          onKeyDown={onKeyDown}
        />
      </div>
    </div>
  );
}

SearchBar.propTypes = {
  placeholder: PropTypes.string,
  value: PropTypes.string,
  onChange: PropTypes.func,
  onKeyDown: PropTypes.func,
};
