import { Link, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import PropTypes from 'prop-types';
import axios from "axios";
import SearchBar from "./SearchBar";
import { useTheme } from "../context/ThemeContext";
import toast from "react-hot-toast";

export default function Header({ username = 'Guest', setUser }) {
  const [vocab, setVocab] = useState("");
  const { theme, toggleTheme } = useTheme();
  const [scrolled, setScrolled] = useState(false);

  const navigate = useNavigate();
  const apiUrl = import.meta.env.VITE_API_BASE_URL;

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleEnterKey = (e) => {
    if (e.key === "Enter") {
      if (vocab.trim()) {
        navigate(`/dictionary/${vocab}`);
      }
    }
  };

  const handleLogout = async () => {
    try {
      const response = await axios.post(`${apiUrl}/logout`, {}, { withCredentials: true });
      
      // Clear custom AI config on logout for security and fresh guest state
      localStorage.removeItem('custom_api_key');
      localStorage.removeItem('custom_model');
      localStorage.removeItem('custom_base_url');
      localStorage.removeItem('ai_provider');
      localStorage.removeItem('ai_override_enabled');
      
      // Reset axios headers
      axios.defaults.headers.common['X-Custom-API-Key'] = '';
      axios.defaults.headers.common['X-Custom-Model'] = '';
      axios.defaults.headers.common['X-Local-URL'] = '';

      setUser(response.data);
      toast.success("Logged out successfully");
      navigate("/");
    } catch (err) {
      console.error("Logout failed", err);
      toast.error("Logout failed");
    }
  };

  const isGuest = username === "Guest";

  return (
    <header 
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 px-4 py-3 sm:px-8
        ${scrolled 
          ? "bg-white/90 dark:bg-black/90 backdrop-blur-xl border-b-2 border-gray-900 dark:border-white/20 py-2 shadow-lg" 
          : "bg-transparent py-4"
        }`}
    >
      <div className="max-w-[1600px] mx-auto flex flex-col gap-4 sm:flex-row sm:justify-between sm:items-center">
        
        {/* Logo Section */}
        <div className="flex items-center gap-8 flex-1">
          <Link 
            to="/" 
            className="group relative inline-block text-3xl font-black tracking-tighter shrink-0"
            onClick={() => setVocab("")}
          >
            <span className="relative z-10 text-gray-900 dark:text-white transition-colors duration-300">
              ReadMando
            </span>
            <span className="absolute inset-0 bg-yellow-300 dark:bg-yellow-600 -rotate-2 transform scale-x-0 scale-y-110 group-hover:scale-x-110 transition-transform origin-center rounded-lg z-0"></span>
          </Link>

          {/* Search bar filling the middle */}
          <div className="hidden lg:block flex-1 max-w-2xl px-4">
            <SearchBar
              placeholder="Search words, pinyin, or English..."
              value={vocab}
              onChange={(e) => setVocab(e.target.value)}
              onKeyDown={handleEnterKey}
            />
          </div>
        </div>

        {/* User & Actions Section */}
        <div className="flex items-center gap-4 sm:gap-8 justify-between sm:justify-end shrink-0">
          
          <div className="hidden md:flex items-center gap-4 bg-gray-100 dark:bg-white/5 p-1 rounded-2xl border-2 border-gray-900 dark:border-white/10">
             <button
                onClick={toggleTheme}
                className="p-2.5 rounded-xl bg-white dark:bg-gray-800 text-lg shadow-[2px_2px_0_0_rgba(0,0,0,1)] dark:shadow-none hover:translate-y-[-1px] active:translate-y-[1px] transition-all cursor-pointer border-2 border-transparent dark:border-white/10"
                aria-label="Toggle theme"
              >
                {theme === 'light' ? '🌙' : '☀️'}
              </button>

              <Link
                to="/settings"
                className="p-2.5 rounded-xl bg-white dark:bg-gray-800 text-lg shadow-[2px_2px_0_0_rgba(0,0,0,1)] dark:shadow-none hover:translate-y-[-1px] active:translate-y-[1px] transition-all cursor-pointer border-2 border-transparent dark:border-white/10"
                aria-label="Settings"
              >
                ⚙️
              </Link>
              
              <div className="flex flex-col pr-4 pl-2 min-w-0">
                 <span className="text-[10px] font-black uppercase tracking-widest text-gray-400 dark:text-gray-500 leading-none mb-1">Authenticated</span>
                 <span className="text-sm font-bold dark:text-gray-200 truncate max-w-[120px] xl:max-w-[200px]" title={username}>
                   {isGuest ? "Guest Learner" : username}
                 </span>
              </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Mobile Theme Toggle (visible when the card above is hidden) */}
            <button
              onClick={toggleTheme}
              className="md:hidden p-2 rounded-xl border-2 border-gray-900 dark:border-white/20 bg-white dark:bg-gray-800 shadow-[2px_2px_0_0_rgba(0,0,0,1)] active:translate-y-[1px] active:shadow-none transition-all cursor-pointer"
            >
              {theme === 'light' ? '🌙' : '☀️'}
            </button>

            {isGuest ? (
              <Link to="/login">
                <button className="bg-blue-600 dark:bg-blue-500 text-white font-black px-6 py-2.5 rounded-xl border-2 border-gray-900 shadow-[4px_4px_0_0_rgba(0,0,0,1)] hover:translate-y-[-2px] hover:shadow-[6px_6px_0_0_rgba(0,0,0,1)] active:translate-y-[1px] active:shadow-none transition-all cursor-pointer text-sm whitespace-nowrap">
                  Join ReadMando
                </button>
              </Link>
            ) : (
              <button
                onClick={handleLogout}
                className="bg-red-500 dark:bg-red-600 text-white font-black px-6 py-2.5 rounded-xl border-2 border-gray-900 shadow-[4px_4px_0_0_rgba(0,0,0,1)] hover:translate-y-[-2px] hover:shadow-[6px_6px_0_0_rgba(0,0,0,1)] active:translate-y-[1px] active:shadow-none transition-all cursor-pointer text-sm whitespace-nowrap"
              >
                Log Out
              </button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}

Header.propTypes = {
    username: PropTypes.string,
    setUser: PropTypes.func
}
