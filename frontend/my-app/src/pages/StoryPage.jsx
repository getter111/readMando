import { useState } from "react";
import axios from "axios";
import StoryDisplay from "../components/StoryDisplay"; 

export default function StoryPage() {
    const [story, setStory] = useState(null); // Ensure story is an object
    const [difficulty, setDifficulty] = useState("Beginner");
    const [topic, setTopic] = useState("");
    const [vocabulary, setVocabulary] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const fetchStory = async () => {
        setLoading(true);
        setError("");
        setStory(null);

        try {
            //first generates the story, then need to use jieba to segment the story into individual words
            const response = await axios.post("http://127.0.0.1:8000/generate_story",{
            // const response = await axios.post("https://read-mando.fly.dev/generate_story", {
                difficulty: difficulty,
                vocabulary: vocabulary.split(",").map(word => word.trim()),
                topic: topic
            });
            console.log("axios response: " , response.data)

            //body of the story (need to segment the title too??)
            const segmentResponse = await axios.post("http://127.0.0.1:8000/segment_story", { 
                content: response.data.content
            });
            console.log("axios 2: " , segmentResponse.data)

            setStory({
                title: response.data.title,
                content: segmentResponse.data.segmented_words
            })

            // setStory(response.data);
        } catch (error) {
            setError("Failed to generate story. Try again!");
            console.error(error);
        } finally {
            setLoading(false);//reset loading state
        }
    };

    return (
        <div className="bg-gray-100 min-h-screen flex flex-col">
            <main className="container mx-auto p-6">
                <h1 className="text-3xl font-bold text-center mb-6">Short Story Generator</h1>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="bg-white p-6 rounded-lg shadow-md">
                        <h2 className="text-xl font-semibold mb-4">Customize Your Story</h2>

                        <div className="mb-4">
                            <label className="block font-medium mb-1">Skill Level:</label>
                            <select
                                className="w-full p-2 border rounded cursor-pointer"
                                value={difficulty}
                                onChange={(e) => setDifficulty(e.target.value)}
                            >
                                <option value="Beginner">Beginner</option>
                                <option value="Intermediate">Intermediate</option>
                                <option value="Advanced">Advanced</option>
                            </select>
                        </div>

                        <div className="mb-4">
                            <label className="block font-medium mb-1">Vocabulary (comma-separated words):</label>
                            <input
                                type="text"
                                className="w-full p-2 border rounded"
                                value={vocabulary}
                                onChange={(e) => setVocabulary(e.target.value)}
                                placeholder="Example: adventure, hero, space"
                            />
                        </div>

                        <div className="mb-4">
                            <label className="block font-medium mb-1">Topic:</label>
                            <input
                                type="text"
                                className="w-full p-2 border rounded"
                                value={topic}
                                onChange={(e) => setTopic(e.target.value)}
                                placeholder="Example: space exploration"
                            />
                        </div>

                        <button
                            onClick={fetchStory}
                            disabled={loading}
                            className="w-full bg-blue-500 text-white p-2 rounded hover:bg-blue-600 transition disabled:bg-gray-400 cursor-pointer"
                        >
                            Generate Story
                        </button>

                        {error && <p className="text-red-500 mt-2">{error}</p>}
                    </div>

                    <div className="bg-white p-6 rounded-lg shadow-md">
                        <h2 className="text-xl font-semibold mb-4">Generated Story:</h2>

                        {loading ? (
                            <p className="text-gray-500">Generating story...</p>
                        ) : story ? (
                            <StoryDisplay story={story} />
                        ) : (
                            <p className="text-gray-500">No story generated yet.</p>
                        )}
                    </div>
                </div>
            </main>
        </div>
    );
}