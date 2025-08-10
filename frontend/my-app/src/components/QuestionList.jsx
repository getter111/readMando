import { useState, useEffect } from "react";
import PropTypes from "prop-types";
import axios from "axios";

function QuestionList({ questions, user_id, storyId }) {
    const [selectedAnswers, setSelectedAnswers] = useState({}); 
    const [score, setScore] = useState({ correct: 0, total: 0 });

    const apiUrl = import.meta.env.VITE_API_BASE_URL;

    // keep track of answer choices
    useEffect(() => {
        const total = questions.length;
        let correct = 0;

        questions.forEach((q, index) => {
            if (selectedAnswers[index] === q.correct_answer) {
                correct += 1;
            }
        });
        setScore({ correct, total });
        // console.log(user_id) undefined if guest
        if (Object.keys(selectedAnswers).length === total && user_id) {
            // Only save score if all questions answered
            saveProgress(Math.round((correct / total) * 100), `${correct}/${total}`); //use recalculated state, since setScore is actually async
        }
    }, [selectedAnswers, questions]); //calls everytime user answers, or when given a new question list

    const saveProgress = async (completion_stats, questions_correct) => {
        const response = await axios.post(`${apiUrl}/save_progress`, {
            "user_id": user_id, //if userid is not undefined
            "story_id": storyId,
            "completion_status": completion_stats,
            "questions_correct": questions_correct
        })
    }

    const handleSelect = (questionIndex, choice) => {
        setSelectedAnswers(prev => ({
            ...prev,
            [questionIndex]: choice
        }));
    };

    const getChoiceStyle = (questionIndex, choice, correctAnswer) => {
        const selected = selectedAnswers[questionIndex];
        if (!selected) return "hover:bg-gray-100 transition";

        if (choice === correctAnswer) {
            return "bg-green-100 border-green-500 text-green-800";
        }
        if (choice === selected) {
            return "bg-red-100 border-red-500 text-red-800";
        }
        return "opacity-50";
    };

    if (!questions || questions.length === 0) {
        return <p className="text-gray-500">No questions available.</p>;
    }

    return (
        <div>
            <h2 className="text-xl font-semibold mb-4">Comprehension Questions</h2>

            {storyId && <p className="text-sm text-[#666666] mb-2">Story ID: {storyId}</p> || 0 }
                <div className="space-y-6">
                    {questions.map((q, index) => (
                        <div key={index} className="p-4 border border-gray-200 rounded-lg shadow-sm">
                            <p className="font-semibold mb-3">{index + 1}. {q.question_text}</p>
                            <div className="space-y-2">
                                {q.answer_choices.map((choice, i) => (
                                    <button
                                        key={i}
                                        onClick={() => handleSelect(index, choice)}
                                        disabled={selectedAnswers[index]}
                                        className={`w-full text-left px-4 py-2 border rounded transition 
                                            ${getChoiceStyle(index, choice, q.correct_answer)}
                                            ${!selectedAnswers[index] ? "cursor-pointer" : "cursor-default"}
                                        `}
                                        aria-label={`Answer choice ${choice} button`}
                                    >
                                        {choice}
                                    </button>
                                ))}
                            </div>

                            {selectedAnswers[index] && (
                                <p className="mt-2 text-sm">
                                    {selectedAnswers[index] === q.correct_answer ? (
                                        <span className="text-green-600 font-semibold">Correct!</span>
                                    ) : (
                                        <span className="text-red-600 font-semibold">
                                            Incorrect. The correct answer was: {q.correct_answer}.
                                        </span>
                                    )}
                                </p>
                            )}
                        </div>
                    ))}    
                </div> 
                {/* show. if length of selectedAnswers keys array === question length*/}
                {Object.keys(selectedAnswers).length === questions.length && (
                    <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded">
                        <h3 className="text-lg font-semibold mb-2">Your Score</h3>
                        <p>Correct: {score.correct} / {score.total}</p>
                        <p>Percentage: {score.total ? Math.round((score.correct / score.total) * 100) : 0}%</p>
                    </div>
                )}  
        </div>
    );
}

QuestionList.propTypes = {
    questions: PropTypes.arrayOf(
        PropTypes.shape({
            question_text: PropTypes.string.isRequired,
            answer_choices: PropTypes.arrayOf(PropTypes.string).isRequired,
            correct_answer: PropTypes.string.isRequired,
        })
    ).isRequired,
    user_id: PropTypes.number.isRequired,
    storyId: PropTypes.number.isRequired
};

export default QuestionList;
