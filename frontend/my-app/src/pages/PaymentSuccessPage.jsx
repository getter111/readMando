import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const PaymentSuccessPage = ({ setUser }) => {
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const apiUrl = import.meta.env.VITE_API_BASE_URL;
        const res = await axios.get(`${apiUrl}/me`, { withCredentials: true });
        if (res.data) {
          setUser(res.data);
        }
      } catch (err) {
        console.error('Failed to fetch user after payment', err);
      }
      setTimeout(() => {
        navigate('/settings');
      }, 3000);
    };
    fetchUser();
  }, [navigate, setUser]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
      <div className="text-center p-8 bg-white dark:bg-gray-800 shadow-xl rounded-2xl border dark:border-white/10 max-w-md w-full">
        <div className="w-20 h-20 mx-auto bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mb-6">
          <svg className="w-10 h-10 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h1 className="text-2xl font-black text-gray-900 dark:text-white mb-2">Payment Successful!</h1>
        <p className="text-gray-500 dark:text-gray-400 mb-8 font-medium">
          Welcome to Pro. You now have access to hosted AI models and more. Redirecting to settings...
        </p>
        <button 
          onClick={() => navigate('/settings')}
          className="w-full bg-gray-900 dark:bg-white text-white dark:text-gray-900 font-black px-6 py-3 rounded-xl border-2 border-gray-900 shadow-[4px_4px_0_0_rgba(0,0,0,1)] dark:shadow-none hover:translate-y-[-2px] active:translate-y-[1px] transition-all cursor-pointer uppercase tracking-widest"
        >
          Return Now
        </button>
      </div>
    </div>
  );
};

export default PaymentSuccessPage;
