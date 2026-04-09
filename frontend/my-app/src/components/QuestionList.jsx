import { useState, useEffect } from "react";
import PropTypes from "prop-types";
import axios from "axios";

function QuestionList({ questions, user_id, storyId }) {
    const [selectedAnswers, setSelectedAnswers] = useState({}); 
    const [score, setScore] = useState({ correct: 0, total: 0 });

    const apiUrl = import.meta.env.VITE_API_BASE_URL;

    useEffect(() => {
        const total = questions.length;
        let correct = 0;
        questions.forEach((q, index) => {
            if (selectedAnswers[index] === q.correct_answer) correct += 1;
        });
        setScore({ correct, total });
        if (Object.keys(selectedAnswers).length === total && user_id) {
            saveProgress(Math.round((correct / total) * 100), `${correct}/${total}`);
        }
    }, [selectedAnswers, questions]);

    const saveProgress = async (completion_stats, questions_correct) => {
        try {
            await axios.post(`${apiUrl}/save_progress`, {
                "user_id": user_id,
                "story_id": storyId,
                "completion_status": completion_stats,
                "questions_correct": questions_correct
            });
        } catch (err) { console.error(err); }
    }

    const handleSelect = (questionIndex, choice) => {
        setSelectedAnswers(prev => ({ ...prev, [questionIndex]: choice }));
    };

    const getChoiceStyle = (questionIndex, choice, correctAnswer) => {
        const selected = selectedAnswers[questionIndex];
        if (!selected) return "hover:bg-gray-100 dark:hover:bg-gray-700 border-gray-200 dark:border-gray-700 dark:text-white";

        if (choice === correctAnswer) {
            return "bg-green-100 dark:bg-green-900/30 border-green-500 text-green-800 dark:text-green-400";
        }
        if (choice === selected) {
            return "bg-red-100 dark:bg-red-900/30 border-red-500 text-red-800 dark:text-red-400";
        }
        return "opacity-30 border-gray-200 dark:border-gray-700 dark:text-gray-500";
    };

    if (!questions || questions.length === 0) return null;

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex items-center justify-between border-b-4 border-gray-900 dark:border-white/10 pb-4">
                <h2 className="text-2xl font-black text-gray-900 dark:text-white flex items-center gap-3">
                    <span className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">🎯</span>
                    Comprehension
                </h2>
                {storyId && (
                    <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">Story ID: #{storyId}</span>
                )}
            </div>
            
            <div className="space-y-8">
                {questions.map((q, index) => (
                    <div key={index} className="space-y-4">
                        <p className="text-lg font-bold text-gray-900 dark:text-white flex gap-3">
                            <span className="flex-shrink-0 w-8 h-8 rounded-full bg-gray-900 dark:bg-gray-700 text-white flex items-center justify-center text-xs">
                                {index + 1}
                            </span>
                            {q.question_text}
                        </p>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pl-11">
                            {q.answer_choices.map((choice, i) => (
                                <button
                                    key={i}
                                    onClick={() => handleSelect(index, choice)}
                                    disabled={selectedAnswers[index]}
                                    className={`text-left px-6 py-3 border-2 rounded-xl font-bold transition-all
                                        ${getChoiceStyle(index, choice, q.correct_answer)}
                                        ${!selectedAnswers[index] ? "cursor-pointer active:scale-95" : "cursor-default"}
                                    `}
                                >
                                    {choice}
                                </button>
                            ))}
                        </div>

                        {selectedAnswers[index] && (
                            <div className="pl-11 animate-in zoom-in-95 duration-200">
                                {selectedAnswers[index] === q.correct_answer ? (
                                    <div className="inline-flex items-center gap-2 text-green-600 dark:text-green-400 font-black text-xs uppercase tracking-widest">
                                        <span className="text-lg">✅</span> Amazing! Correct.
                                    </div>
                                ) : (
                                    <div className="inline-flex items-center gap-2 text-red-600 dark:text-red-400 font-black text-xs uppercase tracking-widest">
                                        <span className="text-lg">❌</span> Oops. Correct: {q.correct_answer}
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                ))}    
            </div> 

            {Object.keys(selectedAnswers).length === questions.length && (
                <div className="mt-12 bg-gray-900 dark:bg-white p-8 rounded-3xl border-4 border-gray-900 shadow-[8px_8px_0_0_rgba(59,130,246,0.5)] flex flex-col md:flex-row items-center justify-between gap-6 transition-all">
                    <div>
                        <h3 className="text-white dark:text-gray-900 text-2xl font-black mb-1 italic">Challenge Complete!</h3>
                        <p className="text-gray-400 dark:text-gray-500 font-bold uppercase tracking-widest text-xs">You've mastered this chapter's key concepts.</p>
                    </div>
                    <div className="flex items-center gap-6">
                        <div className="text-right">
                            <p className="text-[10px] font-black uppercase tracking-widest text-blue-400 dark:text-blue-600">Score</p>
                            <p className="text-4xl font-black text-white dark:text-gray-900">{score.correct}/{score.total}</p>
                        </div>
                        <div className="w-20 h-20 rounded-full border-4 border-blue-500 flex items-center justify-center text-xl font-black text-blue-500 rotate-12">
                            {Math.round((score.correct / score.total) * 100)}%
                        </div>
                    </div>
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
    user_id: PropTypes.number,
    storyId: PropTypes.number
};

export default QuestionList;
