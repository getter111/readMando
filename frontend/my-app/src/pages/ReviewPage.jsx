import { useEffect, useState } from "react";
import axios from "axios";
import PropTypes from "prop-types";
import AudioPlayer from "../components/AudioPlayer";
import { Link } from "react-router-dom";
export default function ReviewPage({ user, loadingUser }) {
  const [stories, setStories] = useState([]);
  const [error, setError] = useState("");
  const apiUrl = import.meta.env.VITE_API_BASE_URL;

  useEffect(() => {
    fetchStories();
  }, []);

  const fetchStories = async () => {
    setError("");
    try {
      const res = await axios.get(`${apiUrl}/stories/all`);
      const storyData = res.data
      // console.log("Fetched stories:", storyData);
      
      setStories(storyData);
      } catch (err) {
        // console.error("Error fetching stories:", err);
        setError("Failed to load stories.");
    }
  };

  const handleUpvote = async (story_id) => {
    if (!user.user_id) {
      alert("Please log in to upvote stories!");
    } 
    else {
      try {
        const res = await axios.put(`${apiUrl}/stories/${story_id}/toggle-upvote`, {}, { withCredentials: true });
        // console.log("Upvote response:", res.data);
        setStories(stories =>
          stories.map(story =>
            story.story_id === story_id
              ? { ...story, upvotes: res.data.upvotes }
              : story
          )
        );
      } catch (err) {
        console.error("Error upvoting story:", err);
      }
    }
  };

  if (loadingUser) return <div className="flex justify-center items-center h-full w-full text-xl">Loading stories...</div>;
  if (error) return <div className="flex justify-center items-center h-full w-full text-xl text-red-500">{error}</div>;

  return (
    <div className="px-4 py-8">
      <h1 className="text-3xl font-bold mb-6 text-center">Top Stories</h1>

      {loadingUser && (
        <div className="flex font-bold justify-center items-center h-full w-full text-xl">
          Loading stories...
        </div>
      )}

      {error && (
        <div className="flex justify-center items-center h-full w-full text-xl text-red-500">
          {error}
        </div>
      )}

      {stories.length === 0 && !loadingUser && (
        <div className="text-center font-bold text-gray-500">No stories yet.</div>
      )}

      <div className="flex flex-col items-center flex-wrap gap-6 justify-center">
        {stories.map((story) => (
          <div
            key={story.story_id}
            className="bg-white border rounded-xl shadow p-6 flex flex-col justify-between w-full sm:w-[48%] lg:w-[31%] transition hover:shadow-lg"
          >
            <div className="flex justify-between items-start mb-3">
              <div>
                <span className="font-bold text-xl">{story.title}</span>
                <span className="ml-2 text-gray-500 font-semibold text-sm">
                  by {story.user_stories?.[0]?.users?.username || "Guest"}
                </span>
              </div>
              <button
                className="text-pink-500 hover:text-pink-700 border p-1 text-xl cursor-pointer font-semibold transition"
                onClick={() => handleUpvote(story.story_id)}
                title="Upvote"
              >
                👍 {story.upvotes || 0}
              </button>
            </div>

            <p className="text-lg mb-3 whitespace-pre-line">
              {story.content.slice(0, 200)}
              {story.content.length > 200 ? "..." : ""}
            </p>

            <div className="flex flex-wrap gap-2 mb-4">
              <span className="text-sm font-semibold text-gray-600 mt-1 flex flex-wrap gap-2 items-center">Vocabulary Used:</span>
              {story.vocabulary?.map((wordObj, idx) => (
                <button
                  key={idx}
                  className="bg-blue-100 font-semibold text-blue-700 px-2 py-1 rounded-lg hover:bg-blue-200 text-sm transition cursor-pointer"
                  onClick={() => window.open(`https://translate.google.com/?sl=en&tl=zh-CN&text=${encodeURIComponent(wordObj)}&op=translate`, "_blank")}
                >
                  {wordObj}
                </button>
              ))}
            </div>

            <div className="flex flex-col sm:flex-row sm:space-x-6 space-y-4 sm:space-y-0">
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold mb-1">Title Audio:</p>
                <AudioPlayer audioUrl={(stories[0].title_audio)} />
                </div>

                <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold mb-1">Story Audio:</p>
                <AudioPlayer audioUrl={stories[0].story_audio} />
              </div>
            </div>
            
            <Link 
              to={`/story/story_id=${story.story_id}`}
              className="text-blue-600 hover:underline mt-auto font-bold transition text-xl"
              state={{story}}
            >
              Read Story →
            </Link>

          </div>
        ))}
      </div>
    </div>
  );
}

ReviewPage.propTypes = {
  user: PropTypes.object,
  loadingUser: PropTypes.bool,
};