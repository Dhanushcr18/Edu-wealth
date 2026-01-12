import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import api from '../api/client';
import { AcademicCapIcon, ArrowRightOnRectangleIcon, PencilIcon } from '@heroicons/react/24/outline';

const profileSchema = Yup.object({
  name: Yup.string().min(2, 'Name must be at least 2 characters').required('Name is required'),
  email: Yup.string().email('Invalid email address').required('Email is required'),
});

const budgetSchema = Yup.object({
  budgetAmount: Yup.number().positive('Budget must be positive').required('Budget is required'),
  currency: Yup.string().required('Currency is required'),
});

const Profile = () => {
  const { user, logout, refreshUser } = useAuth();
  const navigate = useNavigate();
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [editingProfile, setEditingProfile] = useState(false);
  const [editingBudget, setEditingBudget] = useState(false);

  const profileFormik = useFormik({
    initialValues: {
      name: user?.name || '',
      email: user?.email || '',
    },
    validationSchema: profileSchema,
    enableReinitialize: true,
    onSubmit: async (values) => {
      try {
        setError('');
        setSuccess('');
        await api.put('/me', values);
        await refreshUser();
        setSuccess('Profile updated successfully!');
        setEditingProfile(false);
      } catch (err: any) {
        setError(err.response?.data?.error || 'Failed to update profile');
      }
    },
  });

  const budgetFormik = useFormik({
    initialValues: {
      budgetAmount: user?.budgetAmount || '',
      currency: user?.currency || 'INR',
    },
    validationSchema: budgetSchema,
    enableReinitialize: true,
    onSubmit: async (values) => {
      try {
        setError('');
        setSuccess('');
        await api.put('/me/budget', values);
        await refreshUser();
        setSuccess('Budget updated successfully!');
        setEditingBudget(false);
      } catch (err: any) {
        setError(err.response?.data?.error || 'Failed to update budget');
      }
    },
  });

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-emerald-50 to-amber-50 relative overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-96 h-96 bg-gradient-to-r from-emerald-400/20 to-teal-400/20 rounded-full blur-3xl animate-floating"></div>
        <div className="absolute bottom-20 right-10 w-80 h-80 bg-gradient-to-r from-amber-400/20 to-orange-400/20 rounded-full blur-3xl animate-floating" style={{ animationDelay: '2s' }}></div>
      </div>

      {/* Navigation */}
      <nav className="sticky top-0 z-50 backdrop-blur-xl bg-white/70 border-b border-white/20 shadow-lg">
        <div className="container-custom py-4">
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
            <div className="flex items-center space-x-3">
              <Link to="/dashboard" className="px-4 py-2 rounded-lg text-gray-700 hover:bg-white/50 backdrop-blur-sm transition-all hover:shadow-md">
                Dashboard
              </Link>
              <button onClick={handleLogout} className="flex items-center space-x-1 px-4 py-2 rounded-lg text-gray-700 hover:bg-red-50 hover:text-red-600 transition-all hover:shadow-md">
                <ArrowRightOnRectangleIcon className="h-5 w-5" />
                <span>Logout</span>
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="relative container-custom py-8">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent mb-8">
            Profile Settings
          </h1>

          {error && (
            <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg">
              {error}
            </div>
          )}

          {success && (
            <div className="mb-4 p-4 bg-green-100 border border-green-400 text-green-700 rounded-lg">
              {success}
            </div>
          )}

          {/* Profile Information */}
          <div className="card-3d p-6 backdrop-blur-xl bg-white/80 mb-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-semibold text-gray-800">Profile Information</h2>
              {!editingProfile && (
                <button
                  onClick={() => setEditingProfile(true)}
                  className="flex items-center space-x-1 text-emerald-600 hover:text-emerald-700"
                >
                  <PencilIcon className="h-5 w-5" />
                  <span>Edit</span>
                </button>
              )}
            </div>

            {editingProfile ? (
              <form onSubmit={profileFormik.handleSubmit} className="space-y-4">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                    Full Name
                  </label>
                  <input
                    id="name"
                    type="text"
                    className="input"
                    {...profileFormik.getFieldProps('name')}
                  />
                  {profileFormik.touched.name && profileFormik.errors.name && (
                    <p className="mt-1 text-sm text-red-600">{profileFormik.errors.name}</p>
                  )}
                </div>

                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                    Email Address
                  </label>
                  <input
                    id="email"
                    type="email"
                    className="input"
                    {...profileFormik.getFieldProps('email')}
                  />
                  {profileFormik.touched.email && profileFormik.errors.email && (
                    <p className="mt-1 text-sm text-red-600">{profileFormik.errors.email}</p>
                  )}
                </div>

                <div className="flex space-x-3">
                  <button
                    type="submit"
                    disabled={profileFormik.isSubmitting}
                    className="btn btn-primary"
                  >
                    {profileFormik.isSubmitting ? 'Saving...' : 'Save Changes'}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setEditingProfile(false);
                      profileFormik.resetForm();
                    }}
                    className="btn bg-gray-200 text-gray-700 hover:bg-gray-300"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            ) : (
              <div className="space-y-3">
                <div>
                  <p className="text-sm text-gray-600">Name</p>
                  <p className="text-lg font-medium text-gray-900">{user?.name}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Email</p>
                  <p className="text-lg font-medium text-gray-900">{user?.email}</p>
                </div>
              </div>
            )}
          </div>

          {/* Budget Settings */}
          <div className="card-3d p-6 backdrop-blur-xl bg-white/80">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-semibold text-gray-800">Budget Settings</h2>
              {!editingBudget && (
                <button
                  onClick={() => setEditingBudget(true)}
                  className="flex items-center space-x-1 text-primary-600 hover:text-primary-700"
                >
                  <PencilIcon className="h-5 w-5" />
                  <span>Edit</span>
                </button>
              )}
            </div>

            {editingBudget ? (
              <form onSubmit={budgetFormik.handleSubmit} className="space-y-4">
                <div>
                  <label htmlFor="budgetAmount" className="block text-sm font-medium text-gray-700 mb-1">
                    Monthly Budget
                  </label>
                  <input
                    id="budgetAmount"
                    type="number"
                    step="0.01"
                    className="input"
                    {...budgetFormik.getFieldProps('budgetAmount')}
                  />
                  {budgetFormik.touched.budgetAmount && budgetFormik.errors.budgetAmount && (
                    <p className="mt-1 text-sm text-red-600">{budgetFormik.errors.budgetAmount}</p>
                  )}
                </div>

                <div>
                  <label htmlFor="currency" className="block text-sm font-medium text-gray-700 mb-1">
                    Currency
                  </label>
                  <select
                    id="currency"
                    className="input"
                    {...budgetFormik.getFieldProps('currency')}
                  >
                    <option value="INR">INR (₹)</option>
                    <option value="USD">USD ($)</option>
                    <option value="EUR">EUR (€)</option>
                    <option value="GBP">GBP (£)</option>
                  </select>
                  {budgetFormik.touched.currency && budgetFormik.errors.currency && (
                    <p className="mt-1 text-sm text-red-600">{budgetFormik.errors.currency}</p>
                  )}
                </div>

                <div className="flex space-x-3">
                  <button
                    type="submit"
                    disabled={budgetFormik.isSubmitting}
                    className="btn btn-primary"
                  >
                    {budgetFormik.isSubmitting ? 'Saving...' : 'Save Changes'}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setEditingBudget(false);
                      budgetFormik.resetForm();
                    }}
                    className="btn bg-gray-200 text-gray-700 hover:bg-gray-300"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            ) : (
              <div className="space-y-3">
                <div>
                  <p className="text-sm text-gray-600">Monthly Budget</p>
                  <p className="text-lg font-medium text-gray-900">
                    {user?.budgetAmount ? `${user.currency} ${user.budgetAmount}` : 'Not set'}
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
