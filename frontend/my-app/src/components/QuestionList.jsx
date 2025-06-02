import { useState, useEffect } from "react";
import PropTypes from "prop-types";

function QuestionList({ questions }) {
    const [selectedAnswers, setSelectedAnswers] = useState({}); 
    const [score, setScore] = useState({ correct: 0, total: 0 });

    useEffect(() => {
        const total = questions.length;
        let correct = 0;

        questions.forEach((q, index) => {
            if (selectedAnswers[index] === q.correct_answer) {
                correct += 1;
            }
        });
        setScore({ correct, total });

        // if (Object.keys(selectedAnswers).length === total) {
        //     save progress to database 
        // }
    }, [selectedAnswers, questions]);

    const handleSelect = (questionIndex, choice) => {
        setSelectedAnswers(prev => ({
            ...prev,
            [questionIndex]: choice
        }));
        console.log(selectedAnswers)
    };

    const getChoiceStyle = (questionIndex, choice, correctAnswer) => {
        const selected = selectedAnswers[questionIndex];
        if (!selected) return "hover:bg-gray-100";

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
            <div className="space-y-6">
                {questions.map((q, index) => (
                    <div key={index} className="p-4 bg-gray-50 border border-gray-200 rounded-lg shadow-sm">
                        <p className="font-medium mb-3">{index + 1}. {q.question_text}</p>
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
            {/* show. if selectedAnswers keys array === question length*/}
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
};

export default QuestionList;
