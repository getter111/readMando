import { useState } from "react";
import PropTypes from "prop-types";

export default function SearchBar({ placeholder = "Search...", value, onChange, onKeyDown }) {
  const [isFocused, setIsFocused] = useState(false);

  return (
    <div className="relative w-full sm:w-64">
      <svg
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        strokeWidth={1.5}
        stroke="currentColor"
        className={`absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 transition-colors duration-200 pointer-events-none 
          ${isFocused ? 'text-gray-700 font-bold' : 'text-gray-400'}`}
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
        className="w-full pl-10 p-2 border border-gray-300 rounded-md"
        value={value}
        onChange={onChange}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        onKeyDown={onKeyDown}
      />
    </div>
  );
}

SearchBar.propTypes = {
  placeholder: PropTypes.string,
  value: PropTypes.string,
  onChange: PropTypes.func,
  onKeyDown: PropTypes.func,
};
