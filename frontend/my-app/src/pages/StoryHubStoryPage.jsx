import { useState, useEffect, } from "react";
import { useLocation } from "react-router-dom";
import PropTypes from "prop-types";
import AudioPlayer from "../components/AudioPlayer";
import StoryDisplay from "../components/StoryDisplay";
import QuestionList from "../components/QuestionList";
import axios from "axios";
import { Link } from "react-router-dom";

export default function StoryHubStoryPage({ user, loadingUser }) {
    const location = useLocation();
    const initialStory = location.state?.story;

    const [story, setStory] = useState(initialStory);
    const [loadingQuestions, setLoadingQuestions] = useState(false);
    const [questions, setQuestions] = useState(initialStory?.questions || []);

    const apiUrl = import.meta.env.VITE_API_BASE_URL;

    const handleGetQuestions = async () => {
        if (questions.length <= 0) {
            setLoadingQuestions(true);
            try {
                const response = await axios.get(`${apiUrl}/stories/${story.story_id}/questions`);
                setQuestions(response.data);
            } catch (error) {
                console.error("Error fetching questions:", error);
            } finally {
                setLoadingQuestions(false);
            }
        } else{
            console.log("questions already been generated.");
        }
    };

    useEffect(() => {
    async function segmentStory() {
        try {
            const [segmentedBodyRes, segmentedTitleRes] = await Promise.all([
                axios.post(`${apiUrl}/stories/segment`, { content: story.content }),
                axios.post(`${apiUrl}/stories/segment`, { content: story.title }),
            ]);

            setStory((prevStory) => ({
                ...prevStory,
                content: segmentedBodyRes.data.segmented_words,
                title: segmentedTitleRes.data.segmented_words,
            }));
        } catch (err) {
            console.error("Error segmenting story:", err);
        }
    }

    if (story && (typeof story.content === 'string' || typeof story.title === 'string')) {
        segmentStory();
    }
    }, [story?.story_id]);



    if (loadingUser) {
        return <div className="flex justify-center items-center min-h-screen w-full text-xl dark:bg-gray-900 dark:text-white">Loading...</div>;
    }

    if (!story) {
        return <div className="text-center text-gray-500 font-semibold mt-10 dark:text-gray-400">No story data provided.</div>;
    }

    return (
        <div className="bg-gray-100 dark:bg-gray-900 flex flex-col w-full min-h-screen p-6 transition-colors duration-300">
            <main className="container mx-auto bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-xl border dark:border-white/10 flex flex-col gap-6">
                <Link
                    to={`/review`}
                    className="text-blue-600 dark:text-blue-400 hover:underline mt-auto font-black transition text-lg tracking-tight"
                >
                    ← Back to Review
                </Link>

                {(story.title_audio || story.story_audio) && (
                <section className="bg-gray-50 dark:bg-gray-700/50 border dark:border-white/10 p-6 rounded-2xl shadow-sm flex flex-col sm:flex-row sm:space-x-8 space-y-6 sm:space-y-0">
                    {story.title_audio && (
                    <div className="flex-1 min-w-0">
                        <p className="text-xs font-black uppercase tracking-widest text-gray-400 dark:text-gray-500 mb-2">Title Audio</p>
                        <AudioPlayer audioUrl={story.title_audio} />
                    </div>
                    )}
                    {story.story_audio && (
                    <div className="flex-1 min-w-0">
                        <p className="text-xs font-black uppercase tracking-widest text-gray-400 dark:text-gray-500 mb-2">Story Audio</p>
                        <AudioPlayer audioUrl={story.story_audio} />
                    </div>
                    )}
                </section>
                )}

                <div className="border-b-2 border-gray-100 dark:border-white/5 pb-4">
                    <p className="text-xs font-black uppercase tracking-widest text-gray-400 dark:text-gray-500 mb-2">
                        Story Details
                    </p>
                    <div className="flex flex-col gap-2">
                        <p className="text-sm font-bold text-gray-700 dark:text-gray-200">
                            By: <span className="text-blue-600 dark:text-blue-400">{story.user_stories?.[0]?.users?.username || "Guest"}</span>
                        </p>
                        {story.difficulty && (
                            <p className="text-sm font-bold text-gray-700 dark:text-gray-200 uppercase tracking-wide">Level: {story.difficulty}</p>
                        )}
                        {story.topic && (
                            <p className="text-sm font-bold text-gray-700 dark:text-gray-200">Topic: {story.topic.trim()}</p>
                        )}
                    </div>

                    {story.vocabulary && story.vocabulary.length > 0 && (
                        <div className="mt-4 flex flex-wrap gap-2 items-center">
                            <span className="text-xs font-black uppercase tracking-widest text-gray-400 dark:text-gray-500">Vocabulary:</span>
                            {story.vocabulary.map((word, idx) => (
                                <button
                                    key={idx}
                                    className="bg-blue-100 dark:bg-blue-900/40 font-black text-blue-700 dark:text-blue-300 px-3 py-1 rounded-full hover:scale-105 transition cursor-pointer text-xs border border-blue-200 dark:border-blue-800"
                                    onClick={() => window.open(`https://translate.google.com/?sl=en&tl=zh-CN&text=${encodeURIComponent(word)}&op=translate`, "_blank")}
                                >
                                    {word}
                                </button>
                            ))}
                        </div>
                    )}
                </div>

                <section className="bg-white dark:bg-gray-800 rounded-2xl">
                    <StoryDisplay 
                        story={story} 
                        loadingQuestions={loadingQuestions} 
                        fetchQuestions={handleGetQuestions} 
                    />
                </section>

                {questions && questions.length > 0 && story.story_id && (
                <section className="bg-gray-50 dark:bg-gray-700/30 p-6 rounded-2xl border dark:border-white/10 shadow-inner">
                    <h3 className="text-xl font-black mb-4 text-gray-900 dark:text-white uppercase tracking-tighter italic">Reading Check</h3>
                    <QuestionList questions={questions} user_id={user?.user_id} storyId={story.story_id} />
                </section>
                )}
            </main>
        </div>
    );
    }

StoryHubStoryPage.propTypes = {
  user: PropTypes.shape({
    user_id: PropTypes.number,
    username: PropTypes.string,
    email: PropTypes.string,
    is_verified: PropTypes.bool,
  }),
  loadingUser: PropTypes.bool.isRequired,
};
