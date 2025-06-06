import { Link } from "react-router-dom";

export default function VerifiedSuccessPage() {
  return (
    <div className="h-screen w-screen bg-gray-100 flex items-center justify-center px-4">
      <div className="bg-white p-8 rounded-2xl shadow-md text-center max-w-xl w-full">
        <h1 className="text-3xl font-bold text-green-600 mb-4">✅ Email Verified!</h1>
        <p className="text-gray-700 mb-6">
          Your email has been successfully verified. You can now save vocabulary words, review your past stories, and track your progress on ReadMando!
        </p>

        <Link to="/login">
          <button className="bg-blue-500 hover:bg-blue-600 transition text-white px-6 py-3 rounded-lg cursor-pointer">
            Log In Now
          </button>
        </Link>
      </div>
    </div>
  );
}
