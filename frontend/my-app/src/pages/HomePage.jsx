import Header from "../components/Header";
import IntroCard from "../components/IntroCard";
import FeatureCard from "../components/FeatureCard"; 

import DictionaryIMG from '../assets/images/Dictionary.jpg';
import PracticeIMG from '../assets/images/Practice.jpg';
import QuizIMG from '../assets/images/Quiz.jpg';
import TypewriterIMG from '../assets/images/Typewriter.jpg';

export default function HomePage() {
  return (
    <div className="bg-gray-100 min-h-screen">
      <Header />

      <main className="container mx-auto p-6">
        <IntroCard />

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <FeatureCard
            image= {TypewriterIMG}
            title="Short Story Generator"
            buttonText="Start Here"
            onClick={() => alert("Navigate to Short Story Generator")}
          />
          <FeatureCard
            image={PracticeIMG}
            title="Vocabulary Practice"
            buttonText="Learn More"
            onClick={() => alert("Navigate to Vocabulary Practice")}
          />
          <FeatureCard
            image={DictionaryIMG}
            title="Vocabulary Review"
            buttonText="Learn More"
            onClick={() => alert("Navigate to Vocabulary Review")}
          />
          <FeatureCard
            image={QuizIMG}
            title="Interactive Quiz"
            buttonText="Take Quiz"
            onClick={() => alert("Navigate to Interactive Quiz")}
          />
        </div>
      </main>
    </div>
  );
}
