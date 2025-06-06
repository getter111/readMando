import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

export default function RegisterPage() {
    const [username, setUsername] = useState("");
    const [email, setEmail] = useState("");

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState(false);

    const apiUrl = import.meta.env.VITE_API_BASE_URL;
    const navigate = useNavigate();

    const handleRegister = async (e) => {
        e.preventDefault();
        setError("");
        setSuccess(false);
        setLoading(true);
        
        try {
            const response = await axios.post(`${apiUrl}/register`, {
                username,
                email,
            });
            console.log(response.data);
            setSuccess(true);
        } catch (err) {
            console.error("Registration failed", err);
            setError("Could not register. Email or username may already be in use.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="h-screen w-screen flex items-center justify-center bg-gray-100">
            <div className="bg-white p-8 rounded-2xl shadow-lg w-full max-w-xl">
                <h1 className="text-3xl font-bold text-center mb-6">Register</h1>
                <p className="text-center text-gray-600 mb-6 text-sm">
                    Create a ReadMando account to track your learning progress!
                </p>
                
                <form onSubmit={handleRegister} className="space-y-5">
                    <div>
                        <label className="block font-medium mb-1 cursor-text">Username</label>
                        <input
                            type="text"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            className="w-full p-3 border rounded-lg"
                            required
                        />
                    </div>

                    <div>
                        <label className="block font-medium mb-1 cursor-text">Email</label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full p-3 border rounded-lg"
                            required
                        />
                    </div>

                    {error && <p className="text-red-500 text-sm">{error}</p>}
                    {success && (
                        <p className="text-green-600 text-sm">
                            Registration successful! Please check your email to verify your account.
                        </p>
                    )}

                    <button
                        type="submit"
                        className={`w-full bg-blue-500 text-white p-3 rounded-lg transition ${
                            loading ? "bg-gray-400 cursor-default" : "hover:bg-blue-600 cursor-pointer"
                        }`}
                        disabled={loading}
                    >
                        {loading ? "Registering..." : "Register"}
                    </button>
                </form>

                <div className="mt-6 text-center">
                    <p className="text-sm text-gray-600">Already have an account?</p>
                    <button
                        onClick={() => navigate("/login")}
                        className="mt-2 text-blue-500 hover:underline font-medium cursor-pointer select-text"
                    >
                        Login
                    </button>
                </div>
            </div>
        </div>
    );
}
