import { useState, useEffect, useRef } from "react";
import axios from "axios";
import StoryDisplay from "../components/StoryDisplay"; 
import QuestionList from "../components/QuestionList";
import PropTypes from "prop-types";
import AudioPlayer from "../components/AudioPlayer";

import xiaoXiaoAudio from "../assets/audio/zh-CN-XiaoxiaoNeural.mp3"; 
import xiaoYiAudio from "../assets/audio/zh-CN-XiaoyiNeural.mp3"; 
import xiaoBeiAudio from "../assets/audio/zh-CN-liaoning-XiaobeiNeural.mp3"; 
import xiaoNiAudio from "../assets/audio/zh-CN-shaanxi-XiaoniNeural.mp3"; 
import yunJianAudio from "../assets/audio/zh-CN-YunjianNeural.mp3"; 
import yunXiaAudio from "../assets/audio/zh-CN-YunxiaNeural.mp3"; 
import yunXiAudio from "../assets/audio/zh-CN-YunxiNeural.mp3"; 
import yunYangAudio from "../assets/audio/zh-CN-YunyangNeural.mp3"; 

export default function StoryPage({ user, loadingUser }) {
    const [story, setStory] = useState(null);
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
    const [voice, setVoice] = useState("zh-CN-YunxiaNeural");

    const apiUrl = import.meta.env.VITE_API_BASE_URL;
    const currentAudioRef = useRef(null);

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

    const cardStyle = `
        bg-white dark:bg-gray-800 p-8 rounded-2xl border-4 border-gray-900 dark:border-white/10
        shadow-[4px_4px_0_0_rgba(0,0,0,1)] dark:shadow-[4px_4px_0_0_rgba(255,255,255,0.05)]
        transition-all duration-300
    `;

    const inputStyle = `
        w-full p-3 rounded-xl border-2 border-gray-200 dark:border-gray-700 
        bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100
        focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none
        transition-all font-medium
    `;

    const labelStyle = `block text-xs font-black uppercase tracking-widest text-gray-400 dark:text-gray-500 mb-2`;

    useEffect(() => {
        if (!loadingUser && (user.user_id || user.username === "Guest")) {
            hydratePage();
        }
    }, [user, loadingUser]);

    const playVoiceDemo = () => {
        if (currentAudioRef.current) {
            currentAudioRef.current.pause();
            currentAudioRef.current.currentTime = 0; 
        }
        const audio = new Audio(voiceAudioMap[voice]);
        currentAudioRef.current = audio;
        audio.play().catch(console.error);
    };

    const hydratePage = async () => {
        if (user.user_id) {
            try {
                const response = await axios.get(`${apiUrl}/users/${user.user_id}/stories/latest`);
                if (response.data) {
                    const [segmented_body, segmented_title] = await Promise.all([
                        axios.post(`${apiUrl}/stories/segment`, { content: response.data.content }),
                        axios.post(`${apiUrl}/stories/segment`, { content: response.data.title })
                    ]);
                    setStory({
                        title: segmented_title.data.segmented_words,
                        content: segmented_body.data.segmented_words
                    });
                    setDifficulty(response.data.difficulty);
                    setQuestions(response.data.questions);
                    setStoryId(response.data.story_id);
                    setStoryAudio(response.data.story_audio);
                    setTitleAudio(response.data.title_audio);
                    setVoice(response.data.voice);
                    setVocabulary(response.data.vocabulary || "");
                    setTopic(response.data.topic || "");
                }     
            } catch (err) { console.error(err); }
        } else if (user.username === "Guest") {
            const localData = ['story', 'difficulty', 'questions', 'storyId', 'titleAudio', 'storyAudio', 'voiceAudio', 'topic', 'vocabulary'].reduce((acc, key) => {
                acc[key] = localStorage.getItem(key);
                return acc;
            }, {});
            
            if (localData.story) {
                setStory(JSON.parse(localData.story));
                setDifficulty(localData.difficulty);
                setStoryId(localData.storyId ? Number(localData.storyId) : null);
                setStoryAudio(localData.storyAudio);
                setTitleAudio(localData.titleAudio);
                if (localData.questions) setQuestions(JSON.parse(localData.questions));
                if (localData.voiceAudio) setVoice(localData.voiceAudio);
                if (localData.topic) setTopic(localData.topic);
                if (localData.vocabulary) setVocabulary(localData.vocabulary);
            }
        }
    };

    const fetchStory = async () => {
        setLoading(true);
        setError("");
        setStory(null);
        setQuestions([]);
        try {
            const response = await axios.post(`${apiUrl}/stories`, {
                difficulty,
                vocabulary: vocabulary.split(",").map(word => word.trim()),
                topic,
                user: { user_id: user.user_id || "Guest", is_verified: user.is_verified || false },
                voice
            });
        
            const [segmented_body, segmented_title] = await Promise.all([
                axios.post(`${apiUrl}/stories/segment`, { content: response.data.content }),
                axios.post(`${apiUrl}/stories/segment`, { content: response.data.title })
            ]);

            const newStory = {
                title: segmented_title.data.segmented_words,
                content: segmented_body.data.segmented_words
            };
            setStory(newStory);
            setStoryId(response.data.story_id);
            setTitleAudio(response.data.title_audio);
            setStoryAudio(response.data.story_audio);

            if (!user.user_id) {
                localStorage.setItem("story", JSON.stringify(newStory));
                localStorage.setItem("difficulty", difficulty);
                localStorage.setItem("storyId", response.data.story_id);
                localStorage.setItem("titleAudio", response.data.title_audio);
                localStorage.setItem("storyAudio", response.data.story_audio);
                localStorage.setItem("voiceAudio", voice);
                localStorage.setItem("topic", topic);
                localStorage.setItem("vocabulary", vocabulary);
            }
        } catch (error) {
            setError("Failed to generate story. Try again!");
        } finally {
            setLoading(false);
        }
    };

    const fetchQuestions = async () => {
        if (questions.length <= 0) {
            setLoadingQuestions(true);
            try {
                const response = await axios.post(`${apiUrl}/stories/questions`, {
                    story: story.content.join(""),
                    title: story.title.join(""), 
                    difficulty,
                    story_id: storyId
                });
                setQuestions(response.data);
                if (!user.user_id) localStorage.setItem("questions", JSON.stringify(response.data));
            } catch (error) {
                setError("Failed to generate questions. Try again!");
            } finally {
                setLoadingQuestions(false);
            }
        }
    };

    return (
        <div className="flex flex-col w-full pb-20">
            <main className="container mx-auto px-6 max-w-7xl">
                <div className="mb-12 text-center fade-up">
                    <h1 className="text-4xl md:text-5xl font-black tracking-tight text-gray-900 dark:text-white mb-4">
                        Story <span className="text-blue-600">Generator</span>
                    </h1>
                    <p className="text-gray-500 dark:text-gray-400 font-medium max-w-2xl mx-auto">
                        Personalize your learning experience with AI-generated stories tailored to your level and vocabulary.
                    </p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                    {/* Controls Sidebar */}
                    <div className="lg:col-span-5 fade-up" style={{ animationDelay: '100ms' }}>
                        <div className={`${cardStyle} sticky top-28`}>
                            <h2 className="text-2xl font-black mb-8 flex items-center gap-3 dark:text-white">
                                <span className="p-2 bg-yellow-100 dark:bg-yellow-900/30 rounded-lg">⚙️</span>
                                Customize
                            </h2>

                            <div className="space-y-6">
                                <div>
                                    <label className={labelStyle}>Skill Level</label>
                                    <select className={inputStyle} value={difficulty} onChange={(e) => setDifficulty(e.target.value)}>
                                        <option value="Beginner">Beginner</option>
                                        <option value="Intermediate">Intermediate</option>
                                        <option value="Advanced">Advanced</option>
                                    </select>
                                </div>

                                <div>
                                    <label className={labelStyle}>Specific Vocabulary</label>
                                    <textarea
                                        className={`${inputStyle} h-24 resize-none`}
                                        value={vocabulary}
                                        onChange={(e) => setVocabulary(e.target.value)}
                                        placeholder="Add specific words separated by commas (e.g. Apple, Time Machine, Lebron James)..."
                                    />
                                </div>
                                <div>
                                    <label className={labelStyle}>Story Topic</label>
                                    <input 
                                        type="text" 
                                        className={inputStyle}
                                        value={topic}
                                        onChange={(e) => setTopic(e.target.value)}
                                        placeholder="A trip to Mars, a busy coffee shop..."
                                    />
                                </div>
                                
                                <div>
                                    <label className={labelStyle}>Narrator Voice</label>
                                    <div className="flex gap-2">
                                        <select className={inputStyle} value={voice} onChange={(e) => setVoice(e.target.value)}>
                                            <option value="zh-CN-YunxiaNeural">Yunxia 云夏 (Male, Cute)</option>
                                            <option value="zh-CN-XiaoyiNeural">Xiaoyi 小艺 (Female, Lively)</option>
                                            <option value="zh-CN-YunyangNeural">Yunyang 云阳 (Male, News)</option>
                                            <option value="zh-CN-XiaoxiaoNeural">Xiaoxiao 小晓 (Female, Warm)</option>
                                            <option value="zh-CN-YunjianNeural">Yunjian 云健 (Male, Sports)</option>
                                            <option value="zh-CN-YunxiNeural">Yunxi 云希 (Male, Sunshine)</option>
                                        </select>
                                        <button 
                                            onClick={playVoiceDemo}
                                            className="p-3 bg-gray-900 dark:bg-gray-100 dark:text-gray-900 text-white rounded-xl hover:scale-105 active:scale-95 transition-all shadow-lg cursor-pointer"
                                            title="Play Voice Demo"
                                        >
                                            🔊
                                        </button>
                                    </div>
                                </div>

                                <button
                                    onClick={fetchStory}
                                    disabled={loading}
                                    className={`
                                        w-full py-4 mt-4 rounded-2xl font-black text-lg transition-all cursor-pointer
                                        ${loading 
                                            ? 'bg-gray-200 text-gray-400 cursor-not-allowed' 
                                            : 'bg-blue-600 text-white border-4 border-gray-900 dark:border-white/10 shadow-[4px_4px_0_0_rgba(0,0,0,1)] dark:shadow-[4px_4px_0_0_rgba(255,255,255,0.1)] hover:translate-y-[-2px] hover:shadow-[6px_6px_0_0_rgba(0,0,0,1)] active:translate-y-[1px] active:shadow-none'
                                        }
                                    `}
                                >
                                    {loading ? 'Generating...' : '✨ Generate Story'}
                                </button>
                                {error && <p className="text-red-500 font-bold text-center text-sm">{error}</p>}
                            </div>
                        </div>
                    </div>

                    {/* Result Content */}
                    <div className="lg:col-span-7 fade-up" style={{ animationDelay: '200ms' }}>
                        <div className={`${cardStyle} min-h-[600px] flex flex-col`}>
                            {loading ? (
                                <div className="flex-1 flex flex-col items-center justify-center text-center">
                                    <div className="w-16 h-16 border-8 border-blue-100 border-t-blue-600 rounded-full animate-spin mb-4"></div>
                                    <h3 className="text-xl font-black dark:text-white">Crafting your story...</h3>
                                    <p className="text-gray-500">Choosing the best vocabulary and plot twists.</p>
                                </div>
                            ) : story ? (
                                <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
                                    {(titleAudio || storyAudio) && (
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 bg-gray-50 dark:bg-gray-900/50 rounded-2xl border-2 border-gray-900 dark:border-white/10">
                                            {titleAudio && (
                                                <div>
                                                    <label className={labelStyle}>Title Audio</label>
                                                    <AudioPlayer audioUrl={titleAudio} />
                                                </div>
                                            )}
                                            {storyAudio && (
                                                <div>
                                                    <label className={labelStyle}>Full Story Audio</label>
                                                    <AudioPlayer audioUrl={storyAudio} />
                                                </div>
                                            )}
                                        </div>
                                    )}
                                    
                                    <div className="prose dark:prose-invert max-w-none">
                                        <StoryDisplay 
                                            story={story} 
                                            fetchQuestions={fetchQuestions} 
                                            loadingQuestions={loadingQuestions} 
                                        />
                                    </div>
                                </div>
                            ) : (
                                <div className="flex-1 flex flex-col items-center justify-center text-center py-20">
                                    <div className="text-6xl mb-6 grayscale opacity-20">📚</div>
                                    <h3 className="text-xl font-black text-gray-300 dark:text-gray-600">No story generated yet.</h3>
                                    <p className="text-gray-400 dark:text-gray-700 max-w-xs mx-auto">Fill in the details on the left to start your reading adventure!</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {questions.length > 0 && typeof storyId === "number" && (
                    <div className={`${cardStyle} mt-8 fade-up`}>
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
