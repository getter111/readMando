import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

export default function RegisterPage() {
    const [username, setUsername] = useState("");
    const [email, setEmail] = useState("");

    const [loading, setLoading] = useState(false);

    const apiUrl = import.meta.env.VITE_API_BASE_URL;
    const navigate = useNavigate();

    const handleRegister = async (e) => {
        e.preventDefault();
        setLoading(true);
        
        const registerToast = toast.loading("Creating account...");
        try {
            await axios.post(`${apiUrl}/register`, {
                username,
                email,
            });
            toast.success("Registration successful! Check your email to verify.", { id: registerToast });
            setUsername("");
            setEmail("");
        } catch (err) {
            console.error("Registration failed", err);
            toast.error("Registration failed. Email or username may already be in use.", { id: registerToast });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen w-full flex items-center justify-center bg-gray-100 dark:bg-gray-900 transition-colors duration-300">
            <div className="bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-lg w-full max-w-lg border dark:border-white/10">
                <h1 className="text-3xl font-bold text-center mb-2 text-gray-900 dark:text-white">Register</h1>
                <p className="text-center text-gray-600 dark:text-gray-400 font-semibold mb-6 text-sm">
                    Create a ReadMando account to start tracking your progress!
                </p>
                
                <form onSubmit={handleRegister} className="space-y-5">

                    <div>
                        <label className="block font-semibold mb-1 cursor-text text-gray-700 dark:text-gray-300">Email</label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full p-3 border dark:border-white/10 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                            required
                        />
                    </div>
                    
                    <div>
                        <label className="block font-semibold mb-1 cursor-text text-gray-700 dark:text-gray-300">Username</label>
                        <input
                            type="text"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            className="w-full p-3 border dark:border-white/10 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                            required
                        />
                    </div>

                    <button
                        type="submit"
                        className={`w-full bg-blue-600 dark:bg-blue-500 text-white p-3 font-semibold rounded-lg hover:bg-blue-700 dark:hover:bg-blue-600 transition disabled:bg-gray-400 dark:disabled:bg-gray-600 ${loading ? "cursor-default" : "cursor-pointer"}`}
                        disabled={loading}
                    >
                        {loading ? "Registering..." : "Register"}
                    </button>
                </form>

                <div className="mt-6 text-center">
                    <p className="text-sm font-semibold text-gray-600 dark:text-gray-400">Already have an account?</p>
                    <button
                        onClick={() => navigate("/login")}
                        className="mt-2 font-semibold text-blue-600 dark:text-blue-400 hover:underline cursor-pointer select-text"
                    >
                        Login
                    </button>
                </div>
            </div>
        </div>
    );
}
