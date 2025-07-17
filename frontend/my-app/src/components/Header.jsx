import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import PropTypes from 'prop-types'
import axios from "axios";
import SearchBar from "./SearchBar";

export default function Header({ username = 'Guest', setUser}) {
  const [vocab, setVocab] = useState("");
  const [isFocused, setIsFocused] = useState(false);

  const navigate  = useNavigate();
  const apiUrl = import.meta.env.VITE_API_BASE_URL;

  const handleEnterKey = (e) => {
    if (e.key === "Enter") {
      if (vocab.trim()) {
        navigate(`/search/${vocab}`)
      }
    }
  };

  const handleLogout = async () => {
    try {
      const response = await axios.post(`${apiUrl}/logout`, {}, { withCredentials: true });
      setUser(response.data);
      navigate("/")
    } catch (err) {
      console.error("Logout failed", err);
    }
  };

  const isGuest = username === "Guest";

  return (
    <header className="bg-white shadow-md py-4 px-4 sm:px-6 flex flex-col gap-4 sm:flex-row sm:justify-between sm:items-center">
      <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-4 gap-2">
        <Link to="/" className="text-xl font-bold text-blue-500 hover:text-blue-700 transition whitespace-nowrap">
          ReadMando
        </Link>

        <SearchBar
          placeholder="Search Dictionary..."
          value={vocab}
          onChange={(e) => setVocab(e.target.value)}
          onKeyDown={handleEnterKey}
        />
      </div>

      <div className="flex justify-between sm:justify-end items-center gap-2 sm:gap-4">
        <span className="text-sm sm:text-base text-gray-600 font-medium whitespace-nowrap">
          Welcome, {isGuest ? "Guest" : username}
        </span>

        {isGuest ? (
          <Link to="/login">
            <button className="bg-blue-500 hover:bg-blue-600 transition text-white px-4 py-2 rounded-md text-sm cursor-pointer"
                    aria-label={`Go to login / register page`}
            >
              Login / Register
            </button>
          </Link>
        ) : (
          <button
            onClick={handleLogout}
            className="bg-red-500 hover:bg-red-600 transition text-white px-4 py-2 rounded-md text-sm cursor-pointer"
            aria-label={`Logout button`}
          >
            Log Out
          </button>
        )}
      </div>
    </header>
  );
}

Header.propTypes = {
    username: PropTypes.string,
    setUser: PropTypes.func
}