import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";

export default function Header() {
  const [vocab, setVocab] = useState("");
  const navigate  = useNavigate();

  const handleEnterKey = (e) => {
    if (e.key === "Enter") {
      if (vocab.trim()) {
        navigate(`/search/${vocab}`)
      }
    }
  };

  return (
    <header className="bg-white shadow-md py-4 px-6 flex justify-between items-center">
      <div className="flex items-center space-x-4">
        <Link to="/" className="text-xl font-bold text-blue-500 hover:text-blue-700 transition">ReadMando</Link>
        <select className="bg-gray-200 p-2 rounded-md text-sm cursor-pointer">
          <option>Words</option>
          <option>All Words</option>
        </select>
      </div>
      <div className="flex items-center space-x-4">
        <input
          type="text"
          placeholder="Search dictionary..."
          className="p-2 border border-gray-300 rounded-md w-64"
          value = {vocab}
          onChange = {(e) => setVocab(e.target.value)}
          onKeyDown = {handleEnterKey} //Link to /search:vocab
        />
        <Link to="/login">
          <button className="bg-blue-500 hover:bg-blue-600 transition text-white px-4 py-2 rounded-md cursor-pointer">
            Login / Register
          </button>
        </Link>
      </div>
    </header>
  );
}
