import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api/client';
import { AcademicCapIcon, SparklesIcon } from '@heroicons/react/24/outline';

const popularInterests = [
  'Web Development',
  'Mobile App Development',
  'Data Science',
  'Machine Learning',
  'Digital Marketing',
  'Video Editing',
  'Graphic Design',
  'Photography',
  'Content Writing',
  'SEO',
  'UI/UX Design',
  'Game Development',
  'Cybersecurity',
  'Cloud Computing',
  'Business Analytics',
  'Finance & Accounting',
];

const SelectInterests = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [selectedInterests, setSelectedInterests] = useState<string[]>([]);
  const [customInterest, setCustomInterest] = useState('');
  const [loading, setLoading] = useState(false);
  const MAX_INTERESTS = 10;

  useEffect(() => {
    // Check if user already has interests
    checkUserInterests();
  }, []);

  const checkUserInterests = async () => {
    try {
      const response = await api.get('/interests/me');
      if (response.data && response.data.length > 0) {
        // User already has interests, redirect to dashboard
        navigate('/dashboard');
      }
    } catch (error) {
      // User doesn't have interests yet, continue
      console.log('No interests found, showing selection page');
    }
  };

  const toggleInterest = (interest: string) => {
    setSelectedInterests((prev) => {
      if (prev.includes(interest)) {
        return prev.filter((i) => i !== interest);
      }
      if (prev.length >= MAX_INTERESTS) {
        alert(`You can select up to ${MAX_INTERESTS} interests to start. We'll personalize further later!`);
        return prev;
      }
      return [...prev, interest];
    });
  };

  const addCustomInterest = () => {
    const value = customInterest.trim();
    if (!value) return;
    if (selectedInterests.includes(value)) return;
    if (selectedInterests.length >= MAX_INTERESTS) {
      alert(`You can select up to ${MAX_INTERESTS} interests.`);
      return;
    }
    setSelectedInterests([...selectedInterests, value]);
    setCustomInterest('');
  };

  const handleSubmit = async () => {
    if (selectedInterests.length === 0) {
      alert('Please select at least one interest');
      return;
    }

    setLoading(true);
    try {
      // Limit to MAX_INTERESTS for faster personalization
      const interestsToSave = selectedInterests.slice(0, MAX_INTERESTS);
      await api.post('/interests/me', {
        interests: interestsToSave,
      });

      // Redirect to dashboard where courses will be loaded
      navigate('/dashboard');
    } catch (error) {
      console.error('Failed to save interests:', error);
      alert('Failed to save interests. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-emerald-50 to-amber-50 relative overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-96 h-96 bg-gradient-to-r from-emerald-400/30 to-teal-400/30 rounded-full blur-3xl animate-floating"></div>
        <div className="absolute bottom-20 right-10 w-80 h-80 bg-gradient-to-r from-amber-400/30 to-orange-400/30 rounded-full blur-3xl animate-floating" style={{ animationDelay: '2s' }}></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-r from-teal-400/20 to-cyan-400/20 rounded-full blur-3xl animate-floating" style={{ animationDelay: '4s' }}></div>
      </div>

      <div className="container-custom py-12 relative z-10">
        {/* Header */}
        <div className="text-center mb-12 animate-floating">
          <div className="flex justify-center mb-6">
            <div className="relative">
              <AcademicCapIcon className="h-20 w-20 text-emerald-600 animate-pulse-glow" />
              <div className="absolute inset-0 bg-emerald-400/40 blur-2xl rounded-full"></div>
            </div>
          </div>
          <h1 className="text-5xl font-bold mb-4 bg-gradient-to-r from-gray-900 via-gray-700 to-gray-600 bg-clip-text text-transparent">
            Welcome to EduWealth, {user?.name}! 👋
          </h1>
          <p className="text-2xl text-gray-600">
            Let's personalize your learning journey ✨
          </p>
        </div>

        {/* Main Content */}
        <div className="max-w-5xl mx-auto card-3d backdrop-blur-xl bg-white/80 p-10">
          <div className="flex items-center space-x-3 mb-6">
            <div className="relative">
              <SparklesIcon className="h-10 w-10 text-emerald-600 animate-pulse-glow" />
              <div className="absolute inset-0 bg-emerald-400/30 blur-lg rounded-full"></div>
            </div>
            <h2 className="text-3xl font-bold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
              What are you interested in learning?
            </h2>
          </div>
          
          <p className="text-lg text-gray-600 mb-8">
            Select your interests and we'll find the best courses for you from across the web! 🚀
          </p>

          {/* Interest Grid */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mb-10">
            {popularInterests.map((interest, index) => (
              <button
                key={interest}
                onClick={() => toggleInterest(interest)}
                className={`px-5 py-4 rounded-xl font-semibold transition-all duration-300 transform hover:scale-105 ${
                  selectedInterests.includes(interest)
                    ? 'bg-gradient-to-br from-emerald-500 to-teal-600 text-white shadow-xl scale-105 animate-pulse-glow'
                    : 'bg-white/60 backdrop-blur-sm text-gray-700 hover:bg-white/80 shadow-md border border-gray-200'
                }`}
                style={{ animationDelay: `${index * 0.05}s` }}
              >
                {interest}
              </button>
            ))}
          </div>

          {/* Custom Interest Input */}
          <div className="mb-10">
            <label className="block text-base font-semibold text-gray-700 mb-3">
              Don't see your interest? Add your own: 💡
            </label>
            <div className="flex space-x-3">
              <input
                type="text"
                value={customInterest}
                onChange={(e) => setCustomInterest(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && addCustomInterest()}
                placeholder="e.g., Music Production, Cooking, etc."
                className="flex-1 px-5 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all backdrop-blur-sm bg-white/60"
              />
              <button
                onClick={addCustomInterest}
                className="px-8 py-3 bg-gradient-to-r from-emerald-500 to-teal-600 text-white rounded-xl hover:shadow-xl transition-all transform hover:scale-105 font-semibold"
              >
                Add +
              </button>
            </div>
          </div>

          {/* Selected Interests */}
          {selectedInterests.length > 0 && (
            <div className="mb-10 p-6 rounded-2xl bg-gradient-to-br from-emerald-50 to-teal-50 border-2 border-emerald-100">
              <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center space-x-2">
                <span>✅ Selected Interests ({selectedInterests.length}{selectedInterests.length > MAX_INTERESTS ? ` • showing first ${MAX_INTERESTS}` : ''})</span>
              </h3>
              <div className="flex flex-wrap gap-3">
                {selectedInterests.map((interest) => (
                  <span
                    key={interest}
                    className="inline-flex items-center px-4 py-2 rounded-full text-sm font-semibold bg-gradient-to-r from-emerald-500 to-teal-600 text-white shadow-lg hover:shadow-xl transition-all transform hover:scale-105"
                  >
                    {interest}
                    <button
                      onClick={() => toggleInterest(interest)}
                      className="ml-2 text-white hover:text-red-200 font-bold text-lg"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Submit Button */}
          <button
            onClick={handleSubmit}
            disabled={loading || selectedInterests.length === 0}
            className={`w-full py-5 rounded-xl font-bold text-lg text-white transition-all duration-300 transform ${
              loading || selectedInterests.length === 0
                ? 'bg-gray-400 cursor-not-allowed'
                : 'bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 hover:shadow-2xl hover:scale-105 shadow-xl animate-gradient-shift'
            }`}
          >
            {loading ? (
              <span className="flex items-center justify-center">
                <svg className="animate-spin h-5 w-5 mr-3" viewBox="0 0 24 24">
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                    fill="none"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  />
                </svg>
                Finding Perfect Courses for You...
              </span>
            ) : (
              `Continue & Discover Courses`
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default SelectInterests;
