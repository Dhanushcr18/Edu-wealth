import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import api from '../api/client';
import { useAuth } from '../context/AuthContext';
import { CurrencyRupeeIcon, SparklesIcon, AcademicCapIcon } from '@heroicons/react/24/outline';

interface Course {
  id: string;
  title: string;
  price: number;
  currency: string;
  rating: number;
  providerName: string;
  url: string;
  thumbnailUrl?: string;
}

interface ExpenseResponse {
  expense: any;
  analysis: {
    isEssential: boolean;
    category: string;
    message: string;
  };
  recommendations?: Course[];
  savings?: {
    amount: number;
    currency: string;
    message: string;
  };
}

const categories = [
  'Food & Drinks',
  'Entertainment',
  'Shopping',
  'Transport',
  'Subscriptions',
  'Others',
];

const AddExpense = () => {
  const { } = useAuth();
  const [recommendations, setRecommendations] = useState<Course[]>([]);
  const [motivationMessage, setMotivationMessage] = useState('');
  const [showResults, setShowResults] = useState(false);
  const [isEssential, setIsEssential] = useState(false);
  const [error, setError] = useState('');

  const formik = useFormik({
    initialValues: {
      category: '',
      itemName: '',
      amount: '',
      description: '',
    },
    validationSchema: Yup.object({
      category: Yup.string().required('Category is required'),
      itemName: Yup.string().required('Item name is required'),
      amount: Yup.number().positive('Amount must be positive').required('Amount is required'),
      description: Yup.string(),
    }),
    onSubmit: async (values) => {
      try {
        setError('');
        const response = await api.post<ExpenseResponse>('/expenses', {
          ...values,
          amount: parseFloat(values.amount),
        });

        setMotivationMessage(response.data.analysis.message);
        setIsEssential(response.data.analysis.isEssential);
        setRecommendations(response.data.recommendations || []);
        setShowResults(true);
      } catch (err: any) {
        setError(err.response?.data?.error || 'Failed to add expense');
      }
    },
  });

  if (showResults) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-emerald-50 to-amber-50 relative overflow-hidden">
        {/* Animated Background */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-20 left-10 w-96 h-96 bg-gradient-to-r from-emerald-400/20 to-teal-400/20 rounded-full blur-3xl animate-floating"></div>
          <div className="absolute bottom-20 right-10 w-80 h-80 bg-gradient-to-r from-amber-400/20 to-orange-400/20 rounded-full blur-3xl animate-floating" style={{ animationDelay: '2s' }}></div>
        </div>

        <nav className="container-custom py-6 relative z-10">
          <div className="flex justify-between items-center">
            <Link to="/dashboard" className="flex items-center space-x-2 group">
              <div className="relative">
                <AcademicCapIcon className="h-8 w-8 text-emerald-600 animate-pulse-glow" />
                <div className="absolute inset-0 bg-emerald-400/30 blur-lg rounded-full group-hover:bg-emerald-400/50 transition-all"></div>
              </div>
              <span className="text-2xl font-bold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
                EduWealth
              </span>
            </Link>
            <Link to="/dashboard" className="btn btn-secondary shadow-lg">
              Back to Dashboard
            </Link>
          </div>
        </nav>

        <div className="container-custom py-12 relative z-10">
          <div className="max-w-4xl mx-auto">
            {/* Analysis Message */}
            <div className={`card-3d mb-8 text-center backdrop-blur-xl ${isEssential ? 'bg-gradient-to-br from-green-50/90 to-emerald-50/90 border-green-200' : 'bg-gradient-to-br from-yellow-50/90 to-amber-50/90 border-yellow-200'} animate-floating`}>
              <div className="flex justify-center mb-6">
                <div className={`${isEssential ? 'bg-gradient-to-br from-green-100 to-emerald-100' : 'bg-gradient-to-br from-yellow-100 to-amber-100'} rounded-full p-6 shadow-xl relative`}>
                  {isEssential ? (
                    <span className="text-5xl animate-pulse-glow">✅</span>
                  ) : (
                    <SparklesIcon className="h-14 w-14 text-yellow-600 animate-pulse-glow" />
                  )}
                  <div className={`absolute inset-0 ${isEssential ? 'bg-green-400/30' : 'bg-yellow-400/30'} blur-xl rounded-full`}></div>
                </div>
              </div>
              <h2 className="text-4xl font-bold mb-4 bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
                {isEssential ? '✨ Smart Spending!' : '💭 Think Before You Spend!'}
              </h2>
              <p className="text-xl text-gray-700 mb-6 max-w-2xl mx-auto">{motivationMessage}</p>
              <div className={`inline-flex items-center space-x-2 ${isEssential ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'} px-6 py-3 rounded-full shadow-lg backdrop-blur-sm`}>
                <CurrencyRupeeIcon className="h-6 w-6" />
                <span className="font-bold text-lg">₹{formik.values.amount} - {formik.values.itemName}</span>
              </div>
            </div>

            {/* Course Recommendations - Only show for non-essential spending */}
            {!isEssential && recommendations.length > 0 && (
              <div>
                <h3 className="text-3xl font-bold mb-2 bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
                  💡 Instead, Invest in Your Future!
                </h3>
                <p className="text-lg text-gray-600 mb-8">
                  Here are some valuable courses around ₹{formik.values.amount} that will benefit you for life:
                </p>
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                  {recommendations.map((course, index) => (
                    <div 
                      key={course.id} 
                      className="card group"
                      style={{ animationDelay: `${index * 0.1}s` }}
                    >
                      <div className="relative overflow-hidden rounded-t-2xl">
                        {course.thumbnailUrl && (
                          <>
                            <img
                              src={course.thumbnailUrl}
                              alt={course.title}
                              className="w-full h-44 object-cover transition-transform duration-500 group-hover:scale-110"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                          </>
                        )}
                        {course.rating && (
                          <div className="absolute top-3 right-3 px-3 py-1 bg-yellow-400/90 backdrop-blur-sm rounded-full text-sm font-bold text-gray-900 flex items-center space-x-1 shadow-lg">
                            <span>⭐</span>
                            <span>{course.rating}</span>
                          </div>
                        )}
                      </div>
                      <div className="p-5">
                        <span className="text-xs text-gray-500 font-medium">{course.providerName}</span>
                        <h4 className="font-bold text-gray-900 mb-3 mt-1 line-clamp-2 group-hover:text-primary-600 transition-colors">
                          {course.title}
                        </h4>
                        <div className="flex items-center justify-between gap-3 mt-4 pt-4 border-t border-gray-100">
                          <span className="text-2xl font-bold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
                            ₹{course.price}
                          </span>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              console.log('Opening course:', course.url);
                              window.open(course.url, '_blank', 'noopener,noreferrer');
                            }}
                            aria-label={`Enroll in ${course.title}`}
                            className="px-5 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-semibold rounded-lg hover:shadow-xl hover:brightness-110 transition-colors duration-200 cursor-pointer whitespace-nowrap"
                          >
                            Enroll →
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* No courses message - only for non-essential spending */}
            {!isEssential && recommendations.length === 0 && (
              <div className="card text-center mt-6">
                <p className="text-gray-600 mb-4">
                  While we couldn't find courses in this exact price range, remember - every rupee saved is a step closer to your learning goals!
                </p>
              </div>
            )}

            <div className="mt-8 flex justify-center space-x-4">
              <button
                onClick={() => {
                  setShowResults(false);
                  formik.resetForm();
                }}
                className="btn btn-outline"
              >
                Add Another Expense
              </button>
              <Link to="/my-expenses" className="btn btn-primary">
                View All Expenses
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-emerald-50 to-amber-50 relative overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-96 h-96 bg-gradient-to-r from-emerald-400/20 to-teal-400/20 rounded-full blur-3xl animate-floating"></div>
        <div className="absolute bottom-20 right-10 w-80 h-80 bg-gradient-to-r from-amber-400/20 to-orange-400/20 rounded-full blur-3xl animate-floating" style={{ animationDelay: '2s' }}></div>
      </div>

      <nav className="container-custom py-6 relative z-10">
        <div className="flex justify-between items-center">
          <Link to="/dashboard" className="flex items-center space-x-2 group">
            <div className="relative">
              <AcademicCapIcon className="h-8 w-8 text-emerald-600 animate-pulse-glow" />
              <div className="absolute inset-0 bg-emerald-400/30 blur-lg rounded-full group-hover:bg-emerald-400/50 transition-all"></div>
            </div>
            <span className="text-2xl font-bold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
              EduWealth
            </span>
          </Link>
          <div className="flex items-center space-x-4">
            <Link to="/my-expenses" className="text-gray-700 hover:text-emerald-600 font-medium transition-colors">
              My Expenses
            </Link>
            <Link to="/dashboard" className="btn btn-secondary shadow-lg">
              Dashboard
            </Link>
          </div>
        </div>
      </nav>

      <div className="container-custom py-12 relative z-10">
        <div className="max-w-2xl mx-auto">
          <div className="text-center mb-10 animate-floating">
            <h1 className="text-5xl font-bold mb-4 bg-gradient-to-r from-gray-900 via-gray-700 to-gray-600 bg-clip-text text-transparent">
              Track Your Spending 💰
            </h1>
            <p className="text-xl text-gray-600">
              See how your expenses could be transformed into learning opportunities!
            </p>
          </div>

          <div className="card-3d backdrop-blur-xl bg-white/90 p-10">
            {error && (
              <div className="mb-6 p-4 bg-gradient-to-r from-red-50 to-rose-50 border-2 border-red-200 rounded-2xl shadow-lg">
                <p className="text-red-700 font-medium">⚠️ {error}</p>
              </div>
            )}

            <form onSubmit={formik.handleSubmit} className="space-y-7">
              <div>
                <label htmlFor="category" className="text-base font-bold text-gray-800 mb-3 flex items-center space-x-2">
                  <span>📂</span>
                  <span>Category</span>
                </label>
                <select
                  id="category"
                  className="w-full px-5 py-4 bg-gradient-to-r from-white to-gray-50 border-2 border-gray-200 rounded-2xl focus:ring-4 focus:ring-emerald-500/30 focus:border-emerald-500 transition-all text-gray-700 font-medium shadow-sm hover:shadow-md cursor-pointer"
                  {...formik.getFieldProps('category')}
                >
                  <option value="" className="text-gray-400">Select a category</option>
                  {categories.map((cat) => (
                    <option key={cat} value={cat} className="text-gray-700">
                      {cat}
                    </option>
                  ))}
                </select>
                {formik.touched.category && formik.errors.category && (
                  <p className="mt-2 text-sm text-red-600 font-medium">⚠️ {formik.errors.category}</p>
                )}
              </div>

              <div>
                <label htmlFor="itemName" className="text-base font-bold text-gray-800 mb-3 flex items-center space-x-2">
                  <span>🛒</span>
                  <span>What did you spend on?</span>
                </label>
                <input
                  id="itemName"
                  type="text"
                  placeholder="e.g., Burger, Coffee, Movie Ticket"
                  className="w-full px-5 py-4 bg-gradient-to-r from-white to-gray-50 border-2 border-gray-200 rounded-2xl focus:ring-4 focus:ring-primary-500/30 focus:border-primary-500 transition-all text-gray-700 font-medium shadow-sm hover:shadow-md placeholder:text-gray-400"
                  {...formik.getFieldProps('itemName')}
                />
                {formik.touched.itemName && formik.errors.itemName && (
                  <p className="mt-2 text-sm text-red-600 font-medium">⚠️ {formik.errors.itemName}</p>
                )}
              </div>

              <div>
                <label htmlFor="amount" className="text-base font-bold text-gray-800 mb-3 flex items-center space-x-2">
                  <span>💰</span>
                  <span>Amount (₹)</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none">
                    <CurrencyRupeeIcon className="h-6 w-6 text-primary-500" />
                  </div>
                  <input
                    id="amount"
                    type="number"
                    step="0.01"
                    placeholder="60"
                    className="w-full pl-14 pr-5 py-4 bg-gradient-to-r from-white to-gray-50 border-2 border-gray-200 rounded-2xl focus:ring-4 focus:ring-primary-500/30 focus:border-primary-500 transition-all text-gray-700 font-bold text-xl shadow-sm hover:shadow-md placeholder:text-gray-400"
                    {...formik.getFieldProps('amount')}
                  />
                </div>
                {formik.touched.amount && formik.errors.amount && (
                  <p className="mt-2 text-sm text-red-600 font-medium">⚠️ {formik.errors.amount}</p>
                )}
              </div>

              <div>
                <label htmlFor="description" className="text-base font-bold text-gray-800 mb-3 flex items-center space-x-2">
                  <span>📝</span>
                  <span>Description (Optional)</span>
                </label>
                <textarea
                  id="description"
                  rows={4}
                  placeholder="Any additional notes..."
                  className="w-full px-5 py-4 bg-gradient-to-r from-white to-gray-50 border-2 border-gray-200 rounded-2xl focus:ring-4 focus:ring-primary-500/30 focus:border-primary-500 transition-all text-gray-700 font-medium shadow-sm hover:shadow-md placeholder:text-gray-400 resize-none"
                  {...formik.getFieldProps('description')}
                />
              </div>

              <button
                type="submit"
                disabled={formik.isSubmitting}
                className="w-full py-5 rounded-2xl font-bold text-lg text-white bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 hover:shadow-2xl hover:scale-105 transition-all duration-300 shadow-xl disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 animate-gradient-shift"
              >
                {formik.isSubmitting ? (
                  <span className="flex items-center justify-center space-x-2">
                    <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    <span>Processing...</span>
                  </span>
                ) : (
                  '✨ See Course Alternatives'
                )}
              </button>
            </form>
          </div>

          <div className="mt-10 card-3d backdrop-blur-xl bg-gradient-to-br from-emerald-50/90 to-teal-50/90 border-2 border-emerald-200/50 p-8">
            <div className="flex items-start space-x-4">
              <div className="flex-shrink-0">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center shadow-lg">
                  <span className="text-2xl">💡</span>
                </div>
              </div>
              <div>
                <h3 className="font-bold text-xl text-emerald-900 mb-2">Pro Tip</h3>
                <p className="text-emerald-800 text-base leading-relaxed">
                  Every time you spend money, we'll show you courses at similar prices. 
                  This helps you realize how small expenses add up and could be redirected toward learning! 🚀
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddExpense;
