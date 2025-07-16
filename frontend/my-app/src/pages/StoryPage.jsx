import { useState, useEffect } from "react";
import { useRef } from "react";

import axios from "axios";
import StoryDisplay from "../components/StoryDisplay"; 
import QuestionList from "../components/QuestionList";
import PropTypes from "prop-types";
import AudioPlayer from "../components/AudioPlayer"

import xiaoXiaoAudio from "../assets/audio/zh-CN-XiaoxiaoNeural.mp3"; 
import xiaoYiAudio from "../assets/audio/zh-CN-XiaoyiNeural.mp3"; 
import xiaoBeiAudio from "../assets/audio/zh-CN-liaoning-XiaobeiNeural.mp3"; 
import xiaoNiAudio from "../assets/audio/zh-CN-shaanxi-XiaoniNeural.mp3"; 
import yunJianAudio from "../assets/audio/zh-CN-YunjianNeural.mp3"; 
import yunXiaAudio from "../assets/audio/zh-CN-YunxiaNeural.mp3"; 
import yunXiAudio from "../assets/audio/zh-CN-YunxiNeural.mp3"; 
import yunYangAudio from "../assets/audio/zh-CN-YunyangNeural.mp3"; 

export default function StoryPage({ user, loadingUser}) {
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

    const [voice, setVoice] = useState("zh-CN-YunxiaNeural");
    const voiceAudioMap = {
    "zh-CN-XiaoxiaoNeural": xiaoXiaoAudio,
    "zh-CN-XiaoyiNeural": xiaoYiAudio,
    "zh-CN-YunjianNeural": yunJianAudio,
    "zh-CN-YunxiNeural": yunXiAudio,
    "zh-CN-YunxiaNeural": yunXiaAudio,
    "zh-CN-YunyangNeural": yunYangAudio,
    "zh-CN-liaoning-XiaobeiNeural": xiaoBeiAudio,
    "zh-CN-shaanxi-XiaoniNeural": xiaoNiAudio,
};
    //keep track of the current audio being played
    const currentAudioRef = useRef(null);

    //checks if there is a cached story on the first render
    useEffect(() => {
        if (!loadingUser && (user.user_id || user.username === "Guest")) {
            hydratePage();
        }
    }, [user, loadingUser]);

    //plays voice demo for selected voice
    const playVoiceDemo = () => {

        // make sure to pause and reset the prev playing audio
        if (currentAudioRef.current) {
            currentAudioRef.current.pause();
            currentAudioRef.current.currentTime = 0; 
        }

        const audio = new Audio(voiceAudioMap[voice]);
        currentAudioRef.current = audio;
        audio.play().catch((error) => {
            console.error("Error playing audio:", error);
        });
    };

    // hydrates page with users most recent story
        const hydratePage = async () => {
        if (user.user_id) {
            // load from backend for logged in users
            try {
                const response = await axios.get(`${apiUrl}/users/${user.user_id}/stories/latest`);
                console.log("Loading data from backend for", user.username);

                if (response.data) {
                    //segment the body of the story
                    const segmented_body = await axios.post(`${apiUrl}/stories/segment`, { 
                        content: response.data.content
                    });
                    //segment the title of the story 
                    const segmented_title = await axios.post(`${apiUrl}/stories/segment`, { 
                        content: response.data.title
                    });
                    setStory({
                        title: segmented_title.data.segmented_words,
                        content: segmented_body.data.segmented_words
                    });
                    setDifficulty(response.data.difficulty);
                    setQuestions(response.data.questions);
                    setStoryId(response.data.story_id);
                    setStoryAudio(response.data.story_audio);
                    setTitleAudio(response.data.title_audio);
                    setVoice(response.data.voice)
                    setVocabulary(response.data.vocabulary || "");
                    setTopic(response.data.topic || "");
                }     
            } catch (err) {
                console.error("Error fetching user story", err);
            }
        } else if (user.username === "Guest") {
            // load from localStorage for guest users
            console.log("Loading data from localStorage for", user.username);
            const localStory = localStorage.getItem("story");
            const localDifficulty = localStorage.getItem("difficulty");
            const localQuestions = localStorage.getItem("questions");
            const localStoryId = localStorage.getItem("storyId");
            const localTitleAudio = localStorage.getItem("titleAudio");
            const localStoryAudio = localStorage.getItem("storyAudio");
            const localVoiceAudio = localStorage.getItem("voiceAudio");
            const localTopic = localStorage.getItem("topic");
            const localVocabulary = localStorage.getItem("vocabulary");

            if (localStory && localDifficulty) {
                const parsedStory = JSON.parse(localStory);

                setStory(parsedStory);
                setDifficulty(localDifficulty);
                setStoryId(localStoryId);
                setStoryAudio(localTitleAudio);
                setTitleAudio(localStoryAudio);
            }
            if (localQuestions){
                const parsedQuestions = JSON.parse(localQuestions);
                setQuestions(parsedQuestions);
            } 
            if (localVoiceAudio) setVoice(localVoiceAudio);
            if (localTopic) setTopic(localTopic);
            if (localVocabulary) setVocabulary(localVocabulary);
        }
    };

    const fetchStory = async () => {
        setLoading(true);
        setError("");
        setStory(null);
        setQuestions([]); //unmount previous questions component
        try {
            console.log("Generating story... ");
            //first generates the story, then need to use jieba to segment the story into individual words
            const response = await axios.post(`${apiUrl}/stories`,{
                difficulty: difficulty,
                vocabulary: vocabulary.split(",").map(word => word.trim()), //takes vocab string -> string[]
                topic: topic,
                user: { //user is pydantic model so access with dot notation
                    user_id: user.user_id || "Guest",
                    is_verified: user.is_verified || false
                },
                voice: voice
            });
        
            //segment the body of the story
            const segmented_body = await axios.post(`${apiUrl}/stories/segment`, { 
                content: response.data.content
            });
            //segment the title of the story 
            const segmented_title = await axios.post(`${apiUrl}/stories/segment`, { 
                content: response.data.title
            });

            setStory({
                title: segmented_title.data.segmented_words, //title -> []
                content: segmented_body.data.segmented_words //content -> []
            })
            setStoryId(response.data.story_id)
            setTitleAudio(response.data.title_audio);
            setStoryAudio(response.data.story_audio);

            //cache the story in case guest refreshes the page
            if (!user.user_id) {
                localStorage.setItem("story", JSON.stringify({
                    title: segmented_title.data.segmented_words,
                    content: segmented_body.data.segmented_words
                }));
                localStorage.setItem("difficulty", difficulty);
                localStorage.setItem("storyId", response.data.story_id);
                localStorage.setItem("storyId", response.data.story_id);
                localStorage.setItem("titleAudio", response.data.title_audio);
                localStorage.setItem("storyAudio", response.data.story_audio);
                localStorage.setItem("voiceAudio", voice);
                localStorage.setItem("topic", topic);
                localStorage.setItem("vocabulary", vocabulary);
            }

        } catch (error) {
            setError("Failed to generate story. Try again!");
            console.error("Error generating story", error);
        } finally {
            setLoading(false);//reset loading state
        }
    };

    const fetchQuestions = async () => {
        setLoadingQuestions(true);
        setError("");
        try {
            console.log("Generating questions... ");
            const response = await axios.post(`${apiUrl}/stories/questions`, {
                story: story.content.join(""), // convert content & title array into a string
                title: story.title.join(""), 
                difficulty: difficulty,
                story_id: storyId
            });
            setQuestions(response.data)

            // cache the questions[dict] in case guest refreshes the page
            if (!user.user_id) {
                localStorage.setItem("questions", JSON.stringify(response.data));
            }
        } catch (error) {
            setError("Failed to generate questions. Try again!");
            console.error("Error generating questions", error);
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
                                placeholder="Example: quintessential, eloquent, job, applications"
                                />
                            </div>

                            <div className="mb-4">
                                <label className="block font-medium mb-1">Topic:</label>
                                <input
                                type="text"
                                className="w-full p-2 border rounded"
                                value={topic}
                                onChange={(e) => setTopic(e.target.value)}
                                placeholder="Example: exploring space and earth to find aliens, how to apply for a job?"
                                />
                            </div>
                            
                            <div className="mb-4">
                                <label className="block font-medium mb-1">Voice:</label>
                                <select
                                className="w-full p-2 border rounded cursor-pointer"
                                value={voice}
                                onChange={(e) => setVoice(e.target.value)}
                                >
                                    <option value="zh-CN-YunxiaNeural">
                                        Yunxia 云夏 (Male, Cute, Cartoon/Novel)
                                    </option>
                                    <option value="zh-CN-XiaoyiNeural">
                                        Xiaoyi 小艺 (Female, Lively, Cartoon/Novel)
                                    </option>
                                    <option value="zh-CN-YunyangNeural">
                                        Yunyang 云阳 (Male, Professional/Reliable, News)
                                    </option>
                                    <option value="zh-CN-XiaoxiaoNeural">
                                        Xiaoxiao 小晓 (Female, Warm, News/Novel)
                                    </option>
                                    <option value="zh-CN-YunjianNeural">
                                        Yunjian 云健 (Male, Passion, Sports/Novel)
                                    </option>
                                    <option value="zh-CN-YunxiNeural">
                                        Yunxi 云希 (Male, Lively/Sunshine, Novel)
                                    </option>
                                    <option value="zh-CN-liaoning-XiaobeiNeural">
                                        Xiaobei 小贝 (Female, Humorous, Liaoning Dialect)
                                    </option>
                                    <option value="zh-CN-shaanxi-XiaoniNeural">
                                        Xiaoni 小妮 (Female, Bright, Shaanxi Dialect)
                                    </option>
                                </select>
                                <button
                                    type="button"
                                    className="px-3 py-1 bg-gray-200 rounded hover:bg-gray-300 cursor-pointer mt-2"
                                    onClick={playVoiceDemo}
                                >
                                    ▶️ Play Voice Demo
                                </button>
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

                            {/* <button
                                // onClick={fetchStory}
                                disabled={loading}
                                className="w-full bg-red-500 text-white p-2 rounded hover:bg-red-600 transition disabled:bg-gray-400 cursor-pointer"
                            >
                                Clear Story
                            </button> */}
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
                                            <div className="flex-1 min-w-0">
                                                <p className="text-sm font-medium mb-1">Title Audio:</p>
                                                <AudioPlayer audioUrl={titleAudio} />
                                            </div>

                                            <div className="flex-1 min-w-0">
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
                        <QuestionList questions={questions} user_id={user.user_id} storyId={storyId} />
                    </div>
                )}
            </main>
        </div>
    );
}

StoryPage.propTypes = {
  user: PropTypes.shape({
    user_id: PropTypes.number,
    username: PropTypes.string,
    email: PropTypes.string,
    is_verified: PropTypes.bool,
  }),
    loadingUser: PropTypes.bool.isRequired,
};