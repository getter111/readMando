import React, { useState, useEffect } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';

const SettingsPage = ({ user }) => {
  const [apiKey, setApiKey] = useState(localStorage.getItem('custom_api_key') || '');
  const [model, setModel] = useState(localStorage.getItem('custom_model') || '');
  const [baseUrl, setBaseUrl] = useState(localStorage.getItem('custom_base_url') || '');
  const [provider, setProvider] = useState(localStorage.getItem('ai_provider') || 'openai');
  const [aiEnabled, setAiEnabled] = useState(localStorage.getItem('ai_override_enabled') === 'true');
  const [errors, setErrors] = useState({});
  const [subStatus, setSubStatus] = useState(null);
  const [showCancelModal, setShowCancelModal] = useState(false);

  const apiUrl = import.meta.env.VITE_API_BASE_URL;

  useEffect(() => {
    if (user?.subscription_tier === 'pro') {
      axios.get(`${apiUrl}/subscription-status`, { withCredentials: true })
        .then(res => setSubStatus(res.data))
        .catch(err => console.error("Failed to fetch subscription status:", err));
    }
  }, [user, apiUrl]);

  const validate = (finalModel) => {
    const newErrors = {};
    const isPro = user?.subscription_tier === 'pro';

    // Only validate if AI override is enabled
    if (aiEnabled) {
      // Validation logic for free users using custom config
      if (!isPro) {
        if (provider !== 'local' && !apiKey.trim()) {
          newErrors.apiKey = 'API Key is required for non-Pro users';
        }
        if (provider === 'local' && !baseUrl.trim()) {
          newErrors.baseUrl = 'Base URL is required for local models';
        }
      }

      // API Key Prefix Validation
      if (apiKey.trim()) {
        if (provider === 'openai' && !apiKey.trim().startsWith('sk-')) {
          newErrors.apiKey = 'OpenAI keys must start with "sk-"';
        } else if (provider === 'anthropic' && !apiKey.trim().startsWith('sk-ant-')) {
          newErrors.apiKey = 'Anthropic keys must start with "sk-ant-"';
        } else if (provider === 'google' && !apiKey.trim().startsWith('AIza')) {
          newErrors.apiKey = 'Google keys must start with "AIza"';
        }
      }

      // Local AI always requires a model name because we can't guess what they downloaded
      if (provider === 'local' && !finalModel.trim()) {
        newErrors.model = 'Model Name is required for Local AI (e.g. llama3)';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = () => {
    let finalModel = model;
    
    // Intelligently auto-populate cheap models for the big 3 if they leave it blank
    if (aiEnabled && !finalModel.trim()) {
      if (provider === 'anthropic') finalModel = 'claude-3-haiku-20240307';
      else if (provider === 'google') finalModel = 'gemini/gemini-2.5-flash';
      else if (provider === 'openai') finalModel = 'gpt-4o-mini';
      setModel(finalModel); // Updates the UI so the user sees the choice
    } else if (aiEnabled) {
      // Fix Gemini model name prefix if user typed it manually
      if (provider === 'google' && !finalModel.startsWith('gemini/')) {
        finalModel = `gemini/${finalModel}`;
        setModel(finalModel);
      }
    }

    if (!validate(finalModel)) {
      toast.error('Please fix the errors before saving.');
      return;
    }

    localStorage.setItem('custom_api_key', apiKey);
    localStorage.setItem('custom_model', finalModel);
    localStorage.setItem('custom_base_url', baseUrl);
    localStorage.setItem('ai_provider', provider);
    localStorage.setItem('ai_override_enabled', aiEnabled.toString());
    
    // Update axios headers for future requests
    axios.defaults.headers.common['X-Custom-API-Key'] = aiEnabled ? apiKey : '';
    axios.defaults.headers.common['X-Custom-Model'] = aiEnabled ? finalModel : '';
    axios.defaults.headers.common['X-Local-URL'] = aiEnabled ? baseUrl : '';

    toast.success('Settings saved successfully!');
  };

  const handleClear = () => {
    localStorage.removeItem('custom_api_key');
    localStorage.removeItem('custom_model');
    localStorage.removeItem('custom_base_url');
    localStorage.removeItem('ai_provider');
    localStorage.removeItem('ai_override_enabled');
    
    setApiKey('');
    setModel('');
    setBaseUrl('');
    setProvider('openai');
    setAiEnabled(false);
    setErrors({});

    axios.defaults.headers.common['X-Custom-API-Key'] = '';
    axios.defaults.headers.common['X-Custom-Model'] = '';
    axios.defaults.headers.common['X-Local-URL'] = '';

    toast.success('Custom AI configuration cleared!');
  };

  const handleUpgrade = async () => {
    const upgradeToast = toast.loading('Preparing checkout...');
    try {
      const res = await axios.post(`${apiUrl}/create-checkout-session`, {}, { withCredentials: true });
      if (res.data.url) {
        toast.success('Redirecting to Stripe...', { id: upgradeToast });
        window.location.href = res.data.url;
      }
    } catch (err) {
      console.error(err);
      toast.error('Failed to start upgrade process.', { id: upgradeToast });
    }
  };

  const handleUnsubscribe = async () => {
    setShowCancelModal(false);
    const cancelToast = toast.loading('Cancelling subscription...');
    try {
      await axios.post(`${apiUrl}/cancel-subscription`, {}, { withCredentials: true });
      toast.success('Subscription cancelled successfully.', { id: cancelToast });
      setTimeout(() => {
        window.location.reload();
      }, 1500);
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.detail || 'Failed to cancel subscription.', { id: cancelToast });
    }
  };

  const isPro = user?.subscription_tier === 'pro';

  const formatDate = (timestamp) => {
    if (!timestamp) return '';
    return new Date(timestamp * 1000).toLocaleDateString(undefined, { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12 transition-colors duration-300">
      
      {showCancelModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 transition-all duration-300">
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 max-w-sm w-full shadow-2xl border-2 border-gray-900 dark:border-white/10 animate-in zoom-in-95 duration-200">
            <h3 className="text-2xl font-black text-gray-900 dark:text-white mb-4">Cancel Pro?</h3>
            <p className="text-gray-600 dark:text-gray-300 mb-8 font-medium">
              Are you sure you want to cancel your Pro subscription? You will lose access to hosted AI models immediately, and your account will be downgraded to the Free tier.
            </p>
            <div className="flex flex-col sm:flex-row gap-3">
              <button 
                onClick={() => setShowCancelModal(false)}
                className="flex-1 bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white font-bold py-3 px-4 rounded-xl hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
              >
                Keep Pro
              </button>
              <button 
                onClick={handleUnsubscribe}
                className="flex-1 bg-red-600 text-white font-bold py-3 px-4 rounded-xl hover:bg-red-700 transition-colors shadow-[4px_4px_0_0_rgba(0,0,0,1)] hover:translate-y-[-2px] hover:shadow-[6px_6px_0_0_rgba(0,0,0,1)] active:translate-y-[1px] active:shadow-none"
              >
                Yes, Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="max-w-2xl mx-auto p-8 bg-white dark:bg-gray-800 shadow-xl rounded-2xl border dark:border-white/10">
        <h1 className="text-3xl font-black mb-8 text-gray-900 dark:text-white tracking-tight">
          Settings & Subscription
        </h1>
        
        <div className="mb-10 p-6 border-2 border-gray-900 dark:border-white/20 rounded-2xl bg-yellow-50 dark:bg-yellow-900/20 shadow-[4px_4px_0_0_rgba(0,0,0,1)] dark:shadow-none">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold text-gray-900 dark:text-yellow-100">Subscription Status</h2>
            <span className={`px-3 py-1 rounded-full text-sm font-black uppercase tracking-wider ${isPro ? 'bg-green-500 text-white' : 'bg-yellow-400 text-gray-900'}`}>
              {user?.subscription_tier || 'Free'}
            </span>
          </div>
          
          {!isPro ? (
            <div>
              <p className="text-sm text-gray-700 dark:text-gray-300 mb-6 font-medium">
                Running out of credits? Upgrade to Pro for hosted models and zero configuration.
              </p>
              <button 
                onClick={handleUpgrade}
                className="w-full sm:w-auto bg-blue-600 dark:bg-blue-500 text-white font-black px-8 py-3 rounded-xl border-2 border-gray-900 shadow-[4px_4px_0_0_rgba(0,0,0,1)] hover:translate-y-[-2px] hover:shadow-[6px_6px_0_0_rgba(0,0,0,1)] active:translate-y-[1px] active:shadow-none transition-all cursor-pointer"
              >
                Upgrade to Pro — $10/mo
              </button>
            </div>
          ) : (
            <div>
              <p className="text-sm text-green-700 dark:text-green-400 font-bold mb-2">
                ✓ Pro member: Hosted AI models are active. You don't need a custom API key.
              </p>
              {subStatus?.current_period_end && (
                <p className="text-xs text-gray-600 dark:text-gray-400 font-medium mb-6">
                  Next payment processing on: <span className="font-bold text-gray-900 dark:text-white bg-white/50 dark:bg-black/20 px-2 py-1 rounded-md">{formatDate(subStatus.current_period_end)}</span>
                </p>
              )}
              <button 
                onClick={() => setShowCancelModal(true)}
                className="w-full sm:w-auto bg-red-600 dark:bg-red-500 text-white font-black px-8 py-3 rounded-xl border-2 border-gray-900 shadow-[4px_4px_0_0_rgba(0,0,0,1)] hover:translate-y-[-2px] hover:shadow-[6px_6px_0_0_rgba(0,0,0,1)] active:translate-y-[1px] active:shadow-none transition-all cursor-pointer"
              >
                Unsubscribe
              </button>
            </div>
          )}
        </div>

        <div className="space-y-6">
          <div className="flex items-center justify-between border-b-2 border-gray-100 dark:border-white/10 pb-2">
            <div className="flex items-center gap-3">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">Bring Your Own AI</h2>
              {(localStorage.getItem('custom_api_key') || localStorage.getItem('custom_base_url')) && (
                <span className="bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 text-[10px] font-black px-2 py-1 rounded-md uppercase tracking-wider flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></span>
                  Active
                </span>
              )}
            </div>
            <span className="text-[10px] font-black uppercase tracking-widest text-blue-500 dark:text-blue-400">Override Mode</span>
          </div>
          
          <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">
            Connect your own AI account (like OpenAI or Claude) to generate stories. 
            <strong> {isPro ? "Since you're Pro, this is completely optional." : "Required for Free users to generate new stories."}</strong>
          </p>
          
          <div className="grid grid-cols-1 gap-6">
            <div>
              <label className="block text-xs font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-2">AI Provider</label>
              <select 
                value={provider} 
                onChange={(e) => {
                  setProvider(e.target.value);
                  setModel(''); // Always clear the model box when switching providers to prevent confusion
                }}
                className="w-full p-3 border-2 border-gray-200 dark:border-white/10 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:border-blue-500 outline-none transition-all cursor-pointer font-bold"
              >
                <option value="openai">OpenAI (ChatGPT)</option>
                <option value="anthropic">Anthropic (Claude)</option>
                <option value="google">Google (Gemini)</option>
                <option value="local">Local AI (Ollama/LM Studio)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-2">
                Secret API Key {isPro || provider === 'local' ? '(Optional)' : '(Required)'}
              </label>
              <input 
                type="password" 
                value={apiKey} 
                onChange={(e) => {
                  setApiKey(e.target.value);
                  if (errors.apiKey) setErrors({...errors, apiKey: null});
                }}
                placeholder={isPro || provider === 'local' ? "Leave blank to use default settings" : "Paste your API key here (e.g., sk-...)"}
                className={`w-full p-3 border-2 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:border-blue-500 outline-none transition-all ${errors.apiKey ? 'border-red-500' : 'border-gray-200 dark:border-white/10'}`}
              />
              {errors.apiKey && <p className="text-red-500 text-[10px] font-bold mt-1 uppercase">{errors.apiKey}</p>}
            </div>

            <div>
              <div className="flex justify-between mb-2">
                <label className="block text-xs font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest">Model Name (Optional)</label>
              </div>
              <p className="text-[10px] text-gray-500 dark:text-gray-400 mb-2">If you leave this blank, we will automatically choose the best, cheapest model for you.</p>
              <input 
                type="text" 
                value={model} 
                onChange={(e) => setModel(e.target.value)}
                placeholder="e.g., gpt-4o-mini, claude-3-5-sonnet, llama3"
                className="w-full p-3 border-2 border-gray-200 dark:border-white/10 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:border-blue-500 outline-none transition-all"
              />
            </div>

            {provider === 'local' && (
              <div className="animate-in fade-in slide-in-from-top-2 duration-300">
                <label className="block text-xs font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-2">
                  Local Base URL {isPro ? '(Optional)' : '(Required)'}
                </label>
                <input 
                  type="text" 
                  value={baseUrl} 
                  onChange={(e) => {
                    setBaseUrl(e.target.value);
                    if (errors.baseUrl) setErrors({...errors, baseUrl: null});
                  }}
                  placeholder="e.g. http://localhost:11434/v1"
                  className={`w-full p-3 border-2 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:border-blue-500 outline-none transition-all ${errors.baseUrl ? 'border-red-500' : 'border-gray-200 dark:border-white/10'}`}
                />
                {errors.baseUrl && <p className="text-red-500 text-[10px] font-bold mt-1 uppercase">{errors.baseUrl}</p>}
              </div>
            )}
          </div>

          <div className="pt-4 flex flex-col sm:flex-row gap-4">
            <button 
              onClick={handleSave}
              className="flex-1 bg-gray-900 dark:bg-white text-white dark:text-gray-900 font-black px-6 py-4 rounded-xl border-2 border-gray-900 shadow-[4px_4px_0_0_rgba(0,0,0,1)] dark:shadow-none hover:translate-y-[-2px] active:translate-y-[1px] transition-all cursor-pointer uppercase tracking-widest"
            >
              Save Configuration
            </button>
            <button 
              onClick={handleClear}
              className="sm:w-auto bg-white dark:bg-gray-800 text-red-600 dark:text-red-500 font-black px-6 py-4 rounded-xl border-2 border-red-600 dark:border-red-500 shadow-[4px_4px_0_0_rgba(220,38,38,1)] dark:shadow-none hover:translate-y-[-2px] active:translate-y-[1px] transition-all cursor-pointer uppercase tracking-widest"
            >
              Clear
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;
