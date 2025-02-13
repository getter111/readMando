import {useEffect, useState} from 'react';
import {axios} from 'axios'

export default function StoryPage() {

    const [story, setStory] = useState("")
    useEffect(() => {
        const fetchStory = async () => {
            try {
                const response = await axios.get("http://127.0.0.1:8000/generate_story")
                setStory(response)
            } catch (error){
                console.log(error)
            }
        };
        fetchStory()
    }, []);

    return (
        <div>
            <h1>Story Page</h1>
            {story ? <h3>{story.title}</h3> : <h3>Loading title...</h3>}
            {story ? <p>{story.content}</p> : <p>Loading story...</p>}
      </div>
    )
}