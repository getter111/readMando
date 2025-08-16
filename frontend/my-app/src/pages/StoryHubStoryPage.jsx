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
                // console.log("Fetched questions:", response.data);
                setQuestions(response.data);  // Update questions state here!
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
            // console.log(story)
        } catch (err) {
            console.error("Error segmenting story:", err);
        }
    }

    segmentStory();
    }, [story.story_id]);



    if (loadingUser) {
        return <div className="flex justify-center items-center h-full w-full text-xl">Loading...</div>;
    }

    if (!story) {
        return <div className="text-center text-gray-500 font-semibold mt-10">No story data provided.</div>;
    }

    return (
        <div className="bg-gray-100 flex flex-col w-full min-h-screen p-6">
            <main className="container mx-auto bg-white p-6 rounded-lg shadow-md flex flex-col gap-6">
                <Link
                    to={`/review`}
                    className="text-blue-600 hover:underline mt-auto font-bold transition text-lg"
                >
                    ← Back 
                </Link>

                {(story.title_audio || story.story_audio) && (
                <section className="bg-gray-50 border p-4 rounded-md shadow-sm flex flex-col sm:flex-row sm:space-x-6 space-y-4 sm:space-y-0">
                    {story.title_audio && (
                    <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold mb-1">Title Audio:</p>
                        <AudioPlayer audioUrl={story.title_audio} />
                    </div>
                    )}
                    {story.story_audio && (
                    <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold mb-1">Story Audio:</p>
                        <AudioPlayer audioUrl={story.story_audio} />
                    </div>
                    )}
                </section>
                )}

                <div className="mb-6">
                    <p className="text-sm font-semibold text-gray-600 mt-1">
                        by: {story.user_stories?.[0]?.users?.username || "Guest"}
                    </p>
                    {story.difficulty && (
                        <p className="text-sm text-gray-600 mt-1">Difficulty: {story.difficulty}</p>
                    )}
                    {
                        <p className="text-sm text-gray-600 mt-1">Topic: {story.topic?.trim() || "N/A"}</p>
                    }
                    {story.vocabulary && story.vocabulary.length > 0 ? (
                        <div className="text-sm text-gray-600 mt-1 flex flex-wrap gap-2 items-center">
                            <span>Vocabulary used:</span>
                            {story.vocabulary.map((word, idx) => (
                                <button
                                    key={idx}
                                    className="bg-blue-100 font-semibold text-blue-700 px-2 py-1 rounded-lg hover:bg-blue-200 text-sm transition cursor-pointer"
                                    onClick={() => window.open(`https://translate.google.com/?sl=en&tl=zh-CN&text=${encodeURIComponent(word)}&op=translate`, "_blank")}
                                >
                                    {word}
                                </button>
                            ))}
                        </div>
                    ) : (
                        <div>Unknown</div>
                    )}
                </div>

                <section className="mb-6">
                    <StoryDisplay 
                        story={story} 
                        loadingQuestions={loadingQuestions} 
                        fetchQuestions={handleGetQuestions} 
                    />
                </section>

                {questions && questions.length > 0 && story.story_id && (
                <section className="bg-gray-50 p-4 rounded-md shadow-md">
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
