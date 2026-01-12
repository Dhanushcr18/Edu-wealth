import { useState, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { useAuth } from '../context/AuthContext';
import { AcademicCapIcon } from '@heroicons/react/24/outline';
import GoogleLoginButton from '../components/GoogleLoginButton';

const signupSchema = Yup.object({
  name: Yup.string().min(2, 'Name must be at least 2 characters').required('Name is required'),
  email: Yup.string().email('Invalid email address').required('Email is required'),
  password: Yup.string().min(8, 'Password must be at least 8 characters').required('Password is required'),
});

const Signup = () => {
  const [error, setError] = useState('');
  const { signup } = useAuth();
  const navigate = useNavigate();

  const formik = useFormik({
    initialValues: {
      name: '',
      email: '',
      password: '',
    },
    validationSchema: signupSchema,
    onSubmit: async (values) => {
      try {
        setError('');
        await signup(values.name, values.email, values.password);
        // Small delay to ensure state is updated
        setTimeout(() => {
          navigate('/select-interests', { replace: true });
        }, 100);
      } catch (err: any) {
        console.error('Signup error:', err);
        const errorMessage = err.response?.data?.error || err.message || 'Failed to create account';
        setError(errorMessage);
      }
    },
  });

  const passwordStrength = useMemo(() => {
    const value = formik.values.password;
    let score = 0;
    if (value.length >= 8) score += 1;
    if (/[A-Z]/.test(value)) score += 1;
    if (/[0-9]/.test(value)) score += 1;
    if (/[^A-Za-z0-9]/.test(value)) score += 1;

    const levels = [
      { label: 'Weak', color: 'bg-red-400', text: 'Add more characters and a symbol.' },
      { label: 'Fair', color: 'bg-orange-400', text: 'Add uppercase and a number.' },
      { label: 'Good', color: 'bg-amber-400', text: 'Almost there, add a symbol.' },
      { label: 'Strong', color: 'bg-emerald-500', text: 'Looks solid for security.' },
    ];

    const idx = Math.min(score, 3);
    const width = ['w-1/4', 'w-2/4', 'w-3/4', 'w-full'][idx];

    return { ...levels[idx], width, score };
  }, [formik.values.password]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-emerald-50 to-amber-50 flex items-center justify-center py-12 px-4 sm:px-8 lg:px-12 relative overflow-hidden">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -left-20 top-10 w-96 h-96 bg-gradient-to-r from-emerald-400/20 to-teal-400/20 rounded-full blur-3xl floating"></div>
        <div className="absolute -right-10 bottom-0 w-96 h-96 bg-gradient-to-r from-amber-400/20 to-orange-400/20 rounded-full blur-3xl floating" style={{ animationDelay: '1.5s' }}></div>
      </div>

      <div className="relative z-10 w-full max-w-6xl grid lg:grid-cols-2 gap-10 items-start">
        <div className="card p-8 bg-white/80 border border-white/60 shadow-xl">
          <div className="flex items-center space-x-3 mb-4">
            <div className="relative">
              <AcademicCapIcon className="h-10 w-10 text-emerald-600" />
              <div className="absolute inset-0 bg-emerald-400/30 blur-xl rounded-full"></div>
            </div>
            <div>
              <p className="text-sm uppercase tracking-[0.2em] text-emerald-700/70">Wealth for learners</p>
              <h1 className="text-3xl font-bold text-gray-900">Start Your Journey</h1>
            </div>
          </div>

          <p className="text-lg text-gray-700 leading-relaxed mb-6">
            Build your personalized learning and finance hub. Track expenses, pick curated courses, and get actionable insights tailored to your goals.
          </p>

          <div className="grid sm:grid-cols-2 gap-4 mb-6">
            <div className="p-4 rounded-2xl bg-gradient-to-br from-white to-emerald-50 border border-emerald-100 shadow-sm">
              <p className="text-sm font-semibold text-emerald-700">Curated picks</p>
              <p className="text-sm text-gray-600">Courses selected from trusted providers with live pricing.</p>
            </div>
            <div className="p-4 rounded-2xl bg-gradient-to-br from-white to-amber-50 border border-amber-100 shadow-sm">
              <p className="text-sm font-semibold text-amber-700">Smart budgets</p>
              <p className="text-sm text-gray-600">Set targets, track spend, and stay ahead with reminders.</p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex -space-x-2">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="w-10 h-10 rounded-full bg-gradient-to-br from-emerald-500 to-teal-500 border-2 border-white shadow-sm"></div>
              ))}
            </div>
            <div>
              <p className="text-sm font-semibold text-gray-800">Trusted by students & professionals</p>
              <p className="text-xs text-gray-600">Secure by design. Data stays encrypted.</p>
            </div>
          </div>
        </div>

        <div className="card-3d p-8 backdrop-blur-xl bg-white/85 border border-white/60 shadow-2xl">
          {error && (
            <div className="mb-4 p-4 bg-gradient-to-r from-red-50 to-rose-50 border border-red-200 text-red-700 rounded-2xl shadow-md">
              <p className="font-semibold">⚠️ {error}</p>
              {error.includes('already exists') && (
                <p className="mt-2 text-sm text-red-600">
                  Try <Link to="/login" className="underline font-bold hover:text-red-800">signing in</Link> instead or use a different email address.
                </p>
              )}
            </div>
          )}

          <GoogleLoginButton text="Sign up with Google" />

          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-200"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-3 bg-white text-gray-500">Or continue with email</span>
            </div>
          </div>

          <form onSubmit={formik.handleSubmit} className="space-y-5">
            <div>
              <label htmlFor="name" className="block text-sm font-semibold text-gray-800 mb-2">
                Full Name
              </label>
              <input
                id="name"
                type="text"
                autoComplete="name"
                className="input"
                placeholder="e.g., Priya Menon"
                {...formik.getFieldProps('name')}
              />
              {formik.touched.name && formik.errors.name && (
                <p className="mt-1 text-sm text-red-600">{formik.errors.name}</p>
              )}
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-semibold text-gray-800 mb-2">
                Email Address
              </label>
              <input
                id="email"
                type="email"
                autoComplete="email"
                className="input"
                placeholder="you@example.com"
                {...formik.getFieldProps('email')}
              />
              {formik.touched.email && formik.errors.email && (
                <p className="mt-1 text-sm text-red-600">{formik.errors.email}</p>
              )}
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <label htmlFor="password" className="block text-sm font-semibold text-gray-800">
                  Password
                </label>
                <span className="text-xs text-gray-500">Min 8 chars with mix</span>
              </div>
              <input
                id="password"
                type="password"
                autoComplete="new-password"
                className="input"
                placeholder="Add uppercase, number, and symbol"
                {...formik.getFieldProps('password')}
              />
              <div className="mt-2 h-2 bg-gray-100 rounded-full overflow-hidden">
                <div className={`h-full ${passwordStrength.color} ${passwordStrength.width} transition-all duration-500`}></div>
              </div>
              <p className="mt-1 text-xs text-gray-600">{passwordStrength.label}: {passwordStrength.text}</p>
              {formik.touched.password && formik.errors.password && (
                <p className="mt-1 text-sm text-red-600">{formik.errors.password}</p>
              )}
            </div>

            <button
              type="submit"
              disabled={formik.isSubmitting}
              className="w-full btn btn-primary py-3 text-base"
            >
              {formik.isSubmitting ? 'Creating account...' : 'Create Account'}
            </button>
          </form>

          <div className="mt-6 flex items-start gap-3 p-4 bg-gray-50/70 rounded-2xl border border-gray-100">
            <div className="w-2 h-12 rounded-full bg-gradient-to-b from-emerald-500 to-teal-500"></div>
            <div>
              <p className="text-sm font-semibold text-gray-800">What you get inside</p>
              <ul className="mt-1 space-y-1 text-sm text-gray-600">
                <li>• Personalized course picks after onboarding</li>
                <li>• Smart budgets with reminders and summaries</li>
                <li>• Sync across devices with secure tokens</li>
              </ul>
            </div>
          </div>

          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              Already have an account?{' '}
              <Link to="/login" className="font-semibold text-emerald-600 hover:text-emerald-700">
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Signup;
