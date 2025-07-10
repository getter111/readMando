import { useState } from "react";
import axios from "axios";
import PropTypes from "prop-types";
import { useNavigate } from "react-router-dom";


export default function LoginPage({ setUser }) {
    const [email, setEmail] = useState("");
    const [username, setUsername] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState(false);

    const navigate = useNavigate();
    const apiUrl = import.meta.env.VITE_API_BASE_URL;

    const handleLogin = async (e) => {
        e.preventDefault();
        setLoading(true);
        setSuccess(false);
        setError("");

        try {
            const response = await axios.post(`${apiUrl}/login`, {
                email,
                username
            }, { withCredentials: true });
            setSuccess(true);
            setUser(response.data);
        } catch (err) {
            console.error("Login failed", err);
            setError("Invalid email or password");
        } finally {
            setLoading(false);
            setTimeout(() => {
                navigate("/")
            },2000)
        }
    };

    return (
        <div className="h-screen w-screen flex items-center justify-center bg-gray-100">
            <div className="bg-white p-8 rounded-2xl shadow-lg w-full max-w-lg">
                <h1 className="text-3xl font-bold text-center mb-6">Login to ReadMando</h1>

                <form onSubmit={handleLogin} className="space-y-5">
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

                    {error && <p className="text-red-500 text-sm">{error}</p>}
                    {success && (
                        <p className="text-green-600 text-sm">
                            Login successful! Welcome {username}!
                        </p>
                    )}
                    <button
                        type="submit"
                        className={`w-full bg-blue-500 text-white p-3 rounded-lg hover:bg-blue-600 transition disabled:bg-gray-400 ${loading ? "cursor-default" : "cursor-pointer"}`}
                        disabled={loading}
                    >
                        {loading ? "Logging in..." : "Login"}
                    </button>
                </form>

                <div className="mt-6 text-center">
                    <p className="text-sm text-gray-600">
                        Don&apos;t have an account?
                    </p>

                    <button
                        className="mt-2 text-blue-500 hover:underline font-medium cursor-pointer select-text"
                        onClick={() => navigate("/register")}
                    >
                        Register
                    </button>
                </div>
            </div>
        </div>
    );
}

LoginPage.propTypes = {
    setUser: PropTypes.func.isRequired,
};