import IntroCard from "../components/IntroCard";
import FeatureCard from "../components/FeatureCard"; 

import DictionaryIMG from '../assets/images/Dictionary.jpg';
import PracticeIMG from '../assets/images/Practice.jpg';
import QuizIMG from '../assets/images/Quiz.jpg';
import TypewriterIMG from '../assets/images/Typewriter.jpg';

import { useNavigate } from "react-router-dom";

export default function HomePage() {
  const navigate  = useNavigate();

  return (
    <div className="bg-gray-100 w-full h-full">
      <main className="container mx-auto p-6">
        <IntroCard />

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <FeatureCard
            image= {TypewriterIMG}
            title="Story Generator"
            buttonText="Start Here"
            onClick={() => navigate('/story')}
          />
          <FeatureCard
            image={PracticeIMG}
            title="Vocabulary Flashcards"
            buttonText="Practice Study Deck"
            onClick={() => navigate('/study')}
          />
          <FeatureCard
            image={QuizIMG}
            title="Fill in the blank"
            buttonText="Begin"
            onClick={() => navigate('/fill-in-the-blank')}
          />
          <FeatureCard
            image={DictionaryIMG}
            title="Story Review"
            buttonText="Review Past Stories"
            onClick={() => navigate('/review')}
          />
        </div>
      </main>
    </div>
  );
}
