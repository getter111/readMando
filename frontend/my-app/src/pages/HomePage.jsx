import { useNavigate } from "react-router-dom";

import DictionaryIMG from '../assets/images/Dictionary.jpg';
import PracticeIMG from '../assets/images/Practice.jpg';
import TypewriterIMG from '../assets/images/Typewriter.jpg';
import BooksIMG from '../assets/images/Books.jpg';

export default function HomePage() {
  const navigate = useNavigate();

  // Playful Neo-brutalist card style with High Contrast Dark Mode borders
  const cardBaseStyle = `
    group relative block w-full overflow-hidden rounded-2xl border-4 border-gray-900 dark:border-white
    bg-white dark:bg-gray-800 p-6 cursor-pointer transition-all duration-150 ease-out
    shadow-[4px_4px_0_0_rgba(17,24,39,1)] dark:shadow-[4px_4px_0_0_rgba(255,255,255,1)]
    hover:-translate-y-1 hover:shadow-[6px_6px_0_0_rgba(17,24,39,1)] dark:hover:shadow-[6px_6px_0_0_rgba(255,255,255,1)]
    active:translate-y-1 active:shadow-[0px_0px_0_0_rgba(17,24,39,1)]
  `;

  // Standardized description color
  const supportTextStyle = "text-gray-600 dark:text-gray-400 font-medium leading-relaxed";

  // Standardized button style for bento cards
  const buttonStyle = `
    w-full font-black py-2.5 rounded-xl border-4 border-gray-900 dark:border-white 
    transition-all text-sm shadow-[2px_2px_0_0_rgba(0,0,0,1)] dark:shadow-[2px_2px_0_0_rgba(255,255,255,1)]
    hover:translate-y-[-1px] active:translate-y-[1px] active:shadow-none
  `;

  return (
    <div className="min-h-screen bg-transparent text-gray-900 dark:text-gray-100 font-sans selection:bg-yellow-200 selection:text-gray-900 transition-colors duration-300">
      
      {/* --- HERO SECTION --- */}
      <header className="relative overflow-hidden pt-16 pb-20 md:pt-24 md:pb-28">
        <div className="absolute top-10 left-10 w-24 h-24 bg-yellow-300 dark:bg-yellow-600/30 rounded-full mix-blend-multiply dark:mix-blend-overlay filter blur-xl opacity-70 animate-blob"></div>
        <div className="absolute top-0 right-20 w-32 h-32 bg-blue-300 dark:bg-blue-600/30 rounded-full mix-blend-multiply dark:mix-blend-overlay filter blur-xl opacity-70 animate-blob animation-delay-2000"></div>
        <div className="absolute -bottom-8 left-1/2 w-28 h-28 bg-pink-300 dark:bg-pink-600/30 rounded-full mix-blend-multiply dark:mix-blend-overlay filter blur-xl opacity-70 animate-blob animation-delay-4000"></div>

        <div className="relative z-10 mx-auto max-w-5xl px-6 text-center">
          <div className="inline-block mb-4 px-3 py-1 bg-gray-900 dark:bg-blue-600 text-white font-bold tracking-widest uppercase text-[10px] rounded-full shadow-[2px_2px_0_0_#4ade80]">
            System Update Live
          </div>
          <h1 className="text-5xl md:text-7xl font-black tracking-tight text-gray-900 dark:text-white mb-6 leading-tight">
            Turn Stories into <br className="hidden md:block"/>
            <span className="relative inline-block mt-2 md:mt-0">
              <span className="absolute inset-0 bg-yellow-300 dark:bg-yellow-600 -rotate-2 transform scale-110 rounded-lg"></span>
              <span className="relative text-gray-900 dark:text-white">Fluency.</span>
            </span>
          </h1>
          <p className="mt-6 text-lg md:text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto font-medium">
            Explore, create, and master Mandarin Chinese, one story at a time.
            Level up your vocabulary without the boring textbooks.
          </p>
        </div>
      </header>

      {/* --- BENTO BOX GRID --- */}
      <main className="mx-auto max-w-6xl px-6 pb-24">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 auto-rows-min">
          
          {/* STORY GENERATOR */}
          <div 
            className={`${cardBaseStyle} md:col-span-2 overflow-hidden`}
            onClick={() => navigate('/story')}
          >
            <div className="flex flex-col md:flex-row items-center justify-between h-full gap-6">
              <div className="z-10 flex-1">
                <div className="mb-2 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-purple-200 dark:bg-purple-900/30 border-2 border-gray-900 dark:border-white text-xs font-bold uppercase tracking-wide dark:text-purple-300">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-purple-600 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-purple-600"></span>
                  </span>
                  Popular
                </div>
                <h2 className="text-3xl font-black mb-3 text-gray-900 dark:text-white">Story Generator</h2>
                <p className={supportTextStyle + " mb-6"}>
                  Generate immersive, personalized Mandarin stories using the vocabulary you're trying to learn.
                </p>
                <button className={`bg-gray-900 dark:bg-purple-600 text-white ${buttonStyle} w-auto px-8 py-3 text-base`}>
                  Start Reading →
                </button>
              </div>
              <div className="w-full md:w-1/2 aspect-[4/3] rounded-xl border-4 border-gray-900 dark:border-white/20 overflow-hidden relative shadow-[4px_4px_0_0_rgba(17,24,39,1)] dark:shadow-[4px_4px_0_0_rgba(255,255,255,0.1)]">
                <img src={TypewriterIMG} alt="Typewriter" className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-500"/>
              </div>
            </div>
          </div>

          {/* VOCAB FLASHCARDS */}
          <div 
            className={`${cardBaseStyle} flex flex-col`}
            onClick={() => navigate('/study')}
          >
            <div className="mb-2 inline-flex self-start px-2.5 py-1 rounded-md bg-green-200 dark:bg-green-900/30 border-2 border-gray-900 dark:border-white text-xs font-bold uppercase tracking-wide dark:text-green-300">
              Daily Practice 🔥
            </div>
            <h2 className="text-2xl font-black mb-3 text-gray-900 dark:text-white mt-2">Vocab Flashcards</h2>
            <p className={supportTextStyle + " mb-6"}>
              Review saved words using smart spaced-repetition.
            </p>
            <div className="w-full aspect-[16/10] rounded-xl border-4 border-gray-900 dark:border-white/20 overflow-hidden relative shadow-[4px_4px_0_0_rgba(17,24,39,1)] dark:shadow-[4px_4px_0_0_rgba(255,255,255,0.1)] mb-6">
               <img src={PracticeIMG} alt="Practice" className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-500"/>
            </div>
            <button className={`bg-green-400 dark:bg-green-600 text-gray-900 dark:text-white ${buttonStyle}`}>
              Practice Now
            </button>
          </div>

          {/* PDF LIBRARY */}
          <div 
            className={`${cardBaseStyle} md:col-span-2 overflow-hidden group`}
            onClick={() => navigate('/pdf-library')}
          >
            <div className="absolute inset-0 opacity-[0.03] dark:opacity-[0.05] pointer-events-none" style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg width=\'20\' height=\'20\' viewBox=\'0 0 20 20\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cg fill=\'%23000000\' fill-opacity=\'1\' fill-rule=\'evenodd\'%3E%3Ccircle cx=\'3\' cy=\'3\' r=\'3\'/%3E%3Ccircle cx=\'13\' cy=\'13\' r=\'3\'/%3E%3C/g%3E%3C/svg%3E")'}}></div>
            
            <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6 h-full">
              <div className="flex-1">
                <div className="mb-3 inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-pink-200 dark:bg-pink-900/30 border-2 border-pink-900 dark:border-white text-pink-900 dark:text-pink-300 text-[10px] font-black uppercase tracking-widest shadow-[2px_2px_0_0_#831843] dark:shadow-[2px_2px_0_0_rgba(255,255,255,1)]">
                  ✨ Brand New Feature
                </div>
                <h2 className="text-2xl md:text-3xl font-black mb-3 text-pink-900 dark:text-white">PDF Document Library</h2>
                <p className={supportTextStyle + " mb-6 max-w-md"}>
                  Upload Mandarin textbooks or read curated public documents. Extract, parse, and summarize chapters on the fly.
                </p>
                <div className="flex gap-3 items-center">
                  <button className={`bg-pink-500 dark:bg-pink-600 text-white ${buttonStyle} w-auto px-8`}>
                    Open Library
                  </button>
                </div>
              </div>
              <div className="hidden md:flex w-1/3 justify-end items-center relative pr-4">
                 <div className="w-32 h-40 bg-white dark:bg-gray-700 border-4 border-pink-900 dark:border-white rounded-lg shadow-[8px_8px_0_0_rgba(131,24,67,1)] dark:shadow-[8px_8px_0_0_rgba(255,255,255,1)] transform rotate-6 group-hover:rotate-12 transition-transform duration-500 z-20 flex flex-col p-3">
                   <div className="w-1/2 h-2 bg-pink-200 dark:bg-pink-900/50 mb-2 rounded"></div>
                   <div className="w-full h-2 bg-gray-200 dark:bg-gray-600 mb-2 rounded"></div>
                   <div className="w-3/4 h-2 bg-gray-200 dark:bg-gray-600 mb-4 rounded"></div>
                   <div className="w-full flex-1 bg-pink-50 dark:bg-pink-900/20 rounded border-2 border-pink-100 dark:border-pink-500/10 flex items-center justify-center">
                     <span className="text-4xl font-black text-pink-200 dark:text-pink-900/50">PDF</span>
                   </div>
                 </div>
                 <div className="w-32 h-40 bg-pink-100 dark:bg-gray-800 border-4 border-pink-900 dark:border-white/50 rounded-lg absolute -left-4 top-4 -rotate-6 shadow-[4px_4px_0_0_rgba(131,24,67,1)] dark:shadow-[4px_4px_0_0_rgba(255,255,255,0.5)] z-10 opacity-50"></div>
              </div>
            </div>
          </div>

          {/* DICTIONARY (Rich Structure) */}
          <div 
            className={`${cardBaseStyle} flex flex-col`}
            onClick={() => navigate('/dictionary')}
          >
            <div className="mb-2 inline-flex self-start px-2.5 py-1 rounded-md bg-blue-200 dark:bg-blue-900/30 border-2 border-gray-900 dark:border-white text-blue-600 dark:text-blue-300 text-[10px] font-black uppercase tracking-widest">
              10k+ Words
            </div>
            <h2 className="text-2xl font-black mb-3 text-gray-900 dark:text-white mt-2">Dictionary</h2>
            <p className={supportTextStyle + " mb-6 flex-1"}>
              Search pinyin, English, or characters instantly.
            </p>
            <div className="w-full aspect-square rounded-xl border-4 border-gray-900 dark:border-white/20 overflow-hidden relative shadow-[4px_4px_0_0_rgba(17,24,39,1)] dark:shadow-[4px_4px_0_0_rgba(255,255,255,0.1)] mb-6 bg-white">
               <img src={DictionaryIMG} alt="Dictionary" className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-500"/>
            </div>
            <button className={`bg-blue-400 dark:bg-blue-600 text-gray-900 dark:text-white ${buttonStyle}`}>
              Search Words
            </button>
          </div>

          {/* COMMUNITY HUB (Rich Structure) */}
          <div 
            className={`${cardBaseStyle} flex flex-col`}
            onClick={() => navigate('/review')}
          >
            <div className="mb-2 inline-flex self-start px-2.5 py-1 rounded-md bg-orange-200 dark:bg-orange-900/30 border-2 border-gray-900 dark:border-white text-orange-600 dark:text-orange-300 text-[10px] font-black uppercase tracking-widest">
              Live Hub
            </div>
            <h2 className="text-2xl font-black mb-3 text-gray-900 dark:text-white mt-2">Community Hub</h2>
            <p className={supportTextStyle + " mb-6 flex-1"}>
              Read stories generated by other learners.
            </p>
            <div className="w-full aspect-square rounded-xl border-4 border-gray-900 dark:border-white/20 overflow-hidden relative shadow-[4px_4px_0_0_rgba(17,24,39,1)] dark:shadow-[4px_4px_0_0_rgba(255,255,255,0.1)] mb-6">
               <img src={BooksIMG} alt="Books" className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-500"/>
            </div>
            <button className={`bg-orange-400 dark:bg-orange-600 text-gray-900 dark:text-white ${buttonStyle}`}>
              Explore Stories
            </button>
          </div>

        </div>
      </main>
    </div>
  );
}