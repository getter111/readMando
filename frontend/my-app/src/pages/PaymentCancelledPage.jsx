import React from 'react';
import { useNavigate } from 'react-router-dom';

const PaymentCancelledPage = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
      <div className="text-center p-8 bg-white dark:bg-gray-800 shadow-xl rounded-2xl border dark:border-white/10 max-w-md w-full">
        <div className="w-20 h-20 mx-auto bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mb-6">
          <svg className="w-10 h-10 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </div>
        <h1 className="text-2xl font-black text-gray-900 dark:text-white mb-2">Payment Cancelled</h1>
        <p className="text-gray-500 dark:text-gray-400 mb-8 font-medium">
          Your upgrade to Pro was cancelled. No charges were made.
        </p>
        <button 
          onClick={() => navigate('/settings')}
          className="w-full bg-gray-900 dark:bg-white text-white dark:text-gray-900 font-black px-6 py-3 rounded-xl border-2 border-gray-900 shadow-[4px_4px_0_0_rgba(0,0,0,1)] dark:shadow-none hover:translate-y-[-2px] active:translate-y-[1px] transition-all cursor-pointer uppercase tracking-widest"
        >
          Return to Settings
        </button>
      </div>
    </div>
  );
};

export default PaymentCancelledPage;
