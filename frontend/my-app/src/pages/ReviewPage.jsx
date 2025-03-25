import WordHover from "../components/WordHover"


export default function ReviewPage() {
  const words = ["你好", "学习", "快乐", "我"]; 

  return (
    <div className="p-6">
        <h1 className="text-2xl font-bold mb-4">Hover Over a Word</h1>
          <div className="text-lg">
              Try hovering over these words:{" "}
              {words.map((word, index) => (
                <WordHover key={index} word={word} /> 
              ))}
          </div>  
    </div>
  );
}
