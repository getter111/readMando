import { useState, useEffect } from "react";
import axios from "axios";
import StoryDisplay from "../components/StoryDisplay"; 
import QuestionList from "../components/QuestionList";
import PropTypes from "prop-types";
import AudioPlayer from "../components/AudioPlayer"

export default function StoryPage({ user_id }) {
    const [story, setStory] = useState(null); // Ensure story is an object
    const [difficulty, setDifficulty] = useState("Beginner");
    const [topic, setTopic] = useState("");
    const [vocabulary, setVocabulary] = useState("");
    const [loading, setLoading] = useState(false);
    const [loadingQuestions, setLoadingQuestions] = useState(false);
    const [error, setError] = useState("");

    const [storyId, setStoryId] = useState(null);
    const [questions, setQuestions] = useState([]);
    const [titleAudio, setTitleAudio] = useState(null);
    const [storyAudio, setStoryAudio] = useState(null);

    //pass in production url from netlify
    const apiUrl = import.meta.env.VITE_API_BASE_URL;

    //checks if there is a cached story on the first render
    useEffect(() => {
        hydratePage();
    }, []);

    // hydrates page with users most recent story
        const hydratePage = async () => {
        if (user_id) {
            // load from backend for logged in users
            try {
                const response = await axios.get(`${apiUrl}/user/${user_id}/story`);
                console.log("Loading from backend: ", response.data);
        
                if (response.data) {
                    setStory({
                        title: response.data.title,
                        content: response.data.content
                    });
                    setDifficulty(response.data.difficulty);
                    setQuestions(response.data.questions);
                    setStoryId(response.data.story_id);
                    setStoryAudio(response.data.story_audio);
                    setTitleAudio(response.data.title_audio);
                }
            } catch (err) {
                console.error("Error fetching user story", err);
            }
        } else {
            // load from localStorage for guest users
            console.log("Loading story from localStorage");
            const localStory = localStorage.getItem("story");
            const localDifficulty = localStorage.getItem("difficulty");
            const localQuestions = localStorage.getItem("questions");
            const localStoryId = localStorage.getItem("storyId");

            if (localStory && localDifficulty && localQuestions) {
                const parsedStory = JSON.parse(localStory);
                const parsedQuestions = JSON.parse(localQuestions);

                setStory(parsedStory);
                setDifficulty(localDifficulty);
                setQuestions(parsedQuestions);
                setStoryId(localStoryId);
            }
        }
    };

    const fetchStory = async () => {
        setLoading(true);
        setError("");
        setStory(null);
        try {
            //first generates the story, then need to use jieba to segment the story into individual words
            const response = await axios.post(`${apiUrl}/generate_story`,{
                difficulty: difficulty,
                vocabulary: vocabulary.split(",").map(word => word.trim()), //takes vocab string -> string[]
                topic: topic
            });
            console.log("Story and title generation: " , response.data)

            //segment the body of the story
            const segmented_body = await axios.post(`${apiUrl}/segment_story`, { 
                content: response.data.content
            });
            console.log("segmented body: " , segmented_body.data)

            //segment the title of the story 
            const segmented_title = await axios.post(`${apiUrl}/segment_story`, { 
                content: response.data.title
            });
            console.log("segmented title: " , segmented_title.data)

            setStory({
                title: segmented_title.data.segmented_words, //title -> []
                content: segmented_body.data.segmented_words //content -> []
            })
            setStoryId(response.data.story_id)

            //cache the story in case guest refreshes the page
            if (!user_id) {
                localStorage.setItem("story", JSON.stringify({
                    title: segmented_title.data.segmented_words,
                    content: segmented_body.data.segmented_words
                }));
                localStorage.setItem("difficulty", difficulty);
                localStorage.setItem("storyId", response.data.story_id);
            }
        } catch (error) {
            setError("Failed to generate story. Try again!");
            console.error(error);
        } finally {
            setLoading(false);//reset loading state
        }
    };


    const fetchQuestions = async () => {
        setLoadingQuestions(true);
        setError("");
        try {
            const response = await axios.post(`${apiUrl}/generate_questions`, {
                story: story.content.join(""), // convert content & title array into a string
                title: story.title.join(""), 
                difficulty: difficulty,
                story_id: storyId // parseInt(storyId)
            });
            console.log("Questions generated: ", response.data);
            setQuestions(response.data)

            // cache the questions[dict] in case guest refreshes the page
            if (!user_id) {
                localStorage.setItem("questions", JSON.stringify(response.data));
            }
        } catch (error) {
            setError("Failed to generate questions. Try again!");
            console.error(error);
        } finally {
            setLoadingQuestions(false);
        }
    }

    return (
        <div className="bg-gray-100 flex flex-col w-full">
            <main className="container mx-auto p-6 flex-grow">
                <h1 className="text-3xl font-bold text-center mb-6">Short Story Generator</h1>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-stretch">
                    <div className="bg-white p-6 rounded-lg shadow-md flex flex-col justify-between h-full ">
                        <div className="flex flex-col gap-2">
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
                        </div>
                        <div className="space-y-2 mt-4">
                            <button
                                onClick={fetchStory}
                                disabled={loading}
                                className="w-full bg-blue-500 text-white p-2 rounded hover:bg-blue-600 transition disabled:bg-gray-400 cursor-pointer"
                            >
                                Generate Story
                            </button>

                            <button
                                // onClick={fetchStory}
                                disabled={loading}
                                className="w-full bg-red-500 text-white p-2 rounded hover:bg-red-600 transition disabled:bg-gray-400 cursor-pointer"
                            >
                                Clear Story
                            </button>
                        </div>

                        {error && <p className="text-red-500 mt-2">{error}</p>}
                    </div>

                    <div className="bg-white p-6 rounded-lg shadow-md flex flex-col justify-between h-full">
                        <h2 className="text-xl font-semibold mb-4">Generated Story:</h2>

                        {loading ? (
                            <div className="text-gray-500 flex-auto">Generating story...</div>
                        ) : story ? (
                            <>
                                {titleAudio && storyAudio && (
                                    <div className="bg-gray-50 border p-4 rounded-md shadow-sm mb-4">
                                        <div className="flex flex-col sm:flex-row sm:space-x-6 space-y-4 sm:space-y-0">
                                            <div className="flex-1">
                                                <p className="text-sm font-medium mb-1">Title Audio:</p>
                                                <AudioPlayer audioUrl={titleAudio} />
                                            </div>

                                            <div className="flex-1">
                                                <p className="text-sm font-medium mb-1">Story Audio:</p>
                                                <AudioPlayer audioUrl={storyAudio} />
                                            </div>
                                        </div>
                                    </div>
                                )}
                                
                                <StoryDisplay 
                                    story={story} 
                                    fetchQuestions={fetchQuestions} 
                                    loadingQuestions={loadingQuestions} 
                                />
                            </>
                        ) : (
                            <div className="text-gray-500 flex-auto">No story generated yet.</div>
                        )}
                    </div>
                </div>
                {questions.length > 0 && typeof storyId === "number" && (
                    <div className="bg-white mt-6 p-6 rounded-lg shadow-md">
                        <QuestionList questions={questions} user_id={user_id} storyId={storyId} />
                    </div>
                )}
            </main>
        </div>
    );
}

StoryPage.propTypes = {
    user_id: PropTypes.str
} 