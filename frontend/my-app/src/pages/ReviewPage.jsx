import WordHover from "../components/WordHover"


// export default function ReviewPage() {
//   const words = ["你好", "学习", "快乐", "我"]; 

//   return (
//     <div className="p-6">
//         <h1 className="text-2xl font-bold mb-4">Hover Over a Word</h1>
//           <div className="text-lg">
//               Try hovering over these words:{" "}
//               {words.map((word, index) => (
//                 <WordHover key={index} word={word} /> 
//               ))}
//           </div>
//     </div>
//   );
// }

import { useState } from "react";
import axios from "axios";

const apiUrl = "/api";

export default function ReviewPage() {
  const words = ["你好", "学习", "快乐", "我"];
  const [segmentedWords, setSegmentedWords] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchStory = async () => {
    setLoading(true);
    setError(null); // Reset error state before making the request
    try {
      const simpleStory = "这是一个测试故事";
      const segmentResponse = await axios.post(`https://read-mando.fly.dev/segment_story`, {
        content: simpleStory
      });

      console.log("Segment response:", segmentResponse);
      setSegmentedWords(segmentResponse.data); // Assuming response.data contains the segmented words
    } catch (error) {
      console.error("Error segmenting story:", error.response);
      setError("Failed to segment the story. Please try again."); // Set error state
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Hover Over a Word</h1>
      <div className="text-lg">
        Try hovering over these words:{" "}
        {words.map((word, index) => (
          <WordHover key={index} word={word} />
        ))}
      </div>
      <button 
        className="mt-4 p-2 bg-blue-500 text-white rounded" 
        onClick={fetchStory}
      >
        Fetch Story
      </button>
      {loading && <p>Loading...</p>}
      {error && <p className="text-red-500">{error}</p>}
      {segmentedWords.length > 0 && (
        <div className="mt-4">
          <h2 className="text-xl font-bold">Segmented Words:</h2>
          <p>{segmentedWords.join(", ")}</p> {/* Display segmented words */}
        </div>
      )}
    </div>
  );
}
