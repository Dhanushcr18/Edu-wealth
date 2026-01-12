import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const GoogleCallback = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { refreshUser } = useAuth();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const handleCallback = async () => {
      // Get tokens from URL parameters
      const accessToken = searchParams.get('accessToken');
      const refreshToken = searchParams.get('refreshToken');
      const errorParam = searchParams.get('error');

      if (errorParam) {
        setError(getErrorMessage(errorParam));
        setTimeout(() => {
          navigate('/login');
        }, 3000);
        return;
      }

      if (accessToken && refreshToken) {
        try {
          // Store tokens in localStorage
          localStorage.setItem('accessToken', accessToken);
          localStorage.setItem('refreshToken', refreshToken);

          // Refresh user data
          await refreshUser();

          // Redirect to dashboard
          navigate('/dashboard');
        } catch (err) {
          console.error('Error storing tokens:', err);
          setError('Failed to complete authentication. Please try again.');
          setTimeout(() => {
            navigate('/login');
          }, 3000);
        }
      } else {
        setError('Authentication failed. Missing credentials.');
        setTimeout(() => {
          navigate('/login');
        }, 3000);
      }
    };

    handleCallback();
  }, [searchParams, navigate, refreshUser]);

  const getErrorMessage = (errorCode: string): string => {
    const errorMessages: Record<string, string> = {
      google_auth_failed: 'Google authentication failed. Please try again.',
      no_user_data: 'Unable to retrieve user data from Google.',
      callback_failed: 'Authentication callback failed. Please try again.',
    };
    return errorMessages[errorCode] || 'An unknown error occurred.';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-emerald-50 to-amber-50 flex items-center justify-center py-12 px-4">
      <div className="max-w-md w-full">
        <div className="card-3d p-8 backdrop-blur-xl bg-white/80 text-center">
          {error ? (
            <>
              <div className="mb-4">
                <svg
                  className="mx-auto h-16 w-16 text-red-500"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                  />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                Authentication Error
              </h2>
              <p className="text-gray-600 mb-4">{error}</p>
              <p className="text-sm text-gray-500">Redirecting to login...</p>
            </>
          ) : (
            <>
              <div className="mb-4">
                <div className="inline-block animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-emerald-600"></div>
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                Completing Authentication
              </h2>
              <p className="text-gray-600">
                Please wait while we sign you in...
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default GoogleCallback;
