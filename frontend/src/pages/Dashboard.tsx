import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api/client';
import { Course, CoursesResponse } from '../types';
import { AcademicCapIcon, ArrowRightOnRectangleIcon, CurrencyRupeeIcon } from '@heroicons/react/24/outline';

const Dashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [motivationalMessage, setMotivationalMessage] = useState('');

  useEffect(() => {
    checkInterests();
  }, []);

  const checkInterests = async () => {
    try {
      // Check if user has selected interests
      const response = await api.get('/interests/me');
      if (!response.data || response.data.length === 0) {
        // No interests found, redirect to interest selection
        navigate('/select-interests');
        return;
      }
      // User has interests, fetch courses
      fetchCourses();
    } catch (error) {
      console.error('Failed to check interests:', error);
      // If error, try to fetch courses anyway
      fetchCourses();
    }
  };

  const fetchCourses = async () => {
    try {
      const response = await api.get<CoursesResponse>('/courses', {
        params: {
          limit: 12,
          ...(user?.budgetAmount && { max_price: user.budgetAmount }),
        },
      });
      setCourses(response.data.courses);
      setMotivationalMessage(response.data.motivationalMessage || '');
    } catch (error) {
      console.error('Failed to fetch courses:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 relative overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-96 h-96 bg-gradient-to-r from-blue-400/20 to-purple-400/20 rounded-full blur-3xl animate-floating"></div>
        <div className="absolute bottom-20 right-10 w-80 h-80 bg-gradient-to-r from-pink-400/20 to-purple-400/20 rounded-full blur-3xl animate-floating" style={{ animationDelay: '2s' }}></div>
      </div>

      {/* Navigation */}
      <nav className="sticky top-0 z-50 backdrop-blur-xl bg-white/70 border-b border-white/20 shadow-lg">
        <div className="container-custom py-4">
          <div className="flex justify-between items-center">
            <Link to="/dashboard" className="flex items-center space-x-2 group">
              <div className="relative">
                <AcademicCapIcon className="h-8 w-8 text-primary-600 animate-pulse-glow" />
                <div className="absolute inset-0 bg-primary-400/30 blur-lg rounded-full group-hover:bg-primary-400/50 transition-all"></div>
              </div>
              <span className="text-2xl font-bold bg-gradient-to-r from-primary-600 to-purple-600 bg-clip-text text-transparent">
                EduWealth
              </span>
            </Link>
            <div className="flex items-center space-x-3">
              <Link to="/add-expense" className="btn btn-primary btn-sm flex items-center space-x-1 shadow-lg">
                <CurrencyRupeeIcon className="h-5 w-5" />
                <span>Track Spending</span>
              </Link>
              <Link to="/profile" className="px-4 py-2 rounded-lg text-gray-700 hover:bg-white/50 backdrop-blur-sm transition-all hover:shadow-md">
                Profile
              </Link>
              <button onClick={handleLogout} className="flex items-center space-x-1 px-4 py-2 rounded-lg text-gray-700 hover:bg-red-50 hover:text-red-600 transition-all hover:shadow-md">
                <ArrowRightOnRectangleIcon className="h-5 w-5" />
                <span>Logout</span>
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Header */}
      <div className="relative py-16 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-primary-600 via-purple-600 to-pink-600 animate-gradient-shift"></div>
        <div className="absolute inset-0 backdrop-blur-3xl bg-black/10"></div>
        <div className="container-custom relative z-10">
          <div className="text-center text-white">
            <h1 className="text-5xl font-bold mb-4 animate-floating">
              Welcome back, <span className="bg-white/20 px-4 py-2 rounded-lg backdrop-blur-sm">{user?.name}</span>! 🎓
            </h1>
            {motivationalMessage && (
              <p className="text-xl opacity-90 max-w-2xl mx-auto bg-white/10 backdrop-blur-md px-6 py-3 rounded-full border border-white/20">
                {motivationalMessage}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Courses */}
      <div className="container-custom py-12 relative z-10">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
            ✨ Recommended Courses
          </h2>
          <div className="px-4 py-2 bg-white/60 backdrop-blur-md rounded-full border border-white/20 text-sm font-medium text-gray-700">
            {courses.length} courses available
          </div>
        </div>

        {loading ? (
          <div className="text-center py-20">
            <div className="relative inline-block">
              <div className="animate-spin rounded-full h-16 w-16 border-4 border-primary-200 border-t-primary-600"></div>
              <div className="absolute inset-0 rounded-full bg-primary-400/20 blur-xl animate-pulse-glow"></div>
            </div>
            <p className="mt-4 text-gray-600 font-medium">Loading your personalized courses...</p>
          </div>
        ) : courses.length > 0 ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {courses.map((course, index) => (
              <div 
                key={course.id} 
                className="card-3d group"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className="relative overflow-hidden rounded-t-2xl">
                  {course.thumbnailUrl && (
                    <>
                      <img
                        src={course.thumbnailUrl}
                        alt={course.title}
                        className="w-full h-48 object-cover transition-transform duration-500 group-hover:scale-110"
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
                <div className="p-6">
                  <h3 className="text-lg font-bold mb-2 text-gray-900 group-hover:text-primary-600 transition-colors line-clamp-2">
                    {course.title}
                  </h3>
                  <p className="text-sm text-gray-500 mb-3 font-medium">{course.providerName}</p>
                  {course.description && (
                    <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                      {course.description}
                    </p>
                  )}
                  <div className="flex items-center justify-between mb-4 pb-4 border-b border-gray-100">
                    <div>
                      {course.price ? (
                        <div className="flex items-center space-x-1">
                          <span className="text-2xl font-bold bg-gradient-to-r from-primary-600 to-purple-600 bg-clip-text text-transparent">
                            {course.currency} {course.price}
                          </span>
                        </div>
                      ) : (
                        <span className="text-2xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
                          Free
                        </span>
                      )}
                    </div>
                  </div>
                  <a
                    href={course.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn btn-primary w-full text-center group-hover:shadow-xl transition-all"
                  >
                    Enroll Now →
                  </a>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-20">
            <div className="card-3d max-w-md mx-auto p-12">
              <div className="text-6xl mb-4">📚</div>
              <p className="text-lg text-gray-600 mb-6">No courses found. Try adjusting your budget or interests.</p>
              <Link to="/onboarding/interests" className="btn btn-primary shadow-lg">
                Update Interests
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
