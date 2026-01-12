import { Link } from 'react-router-dom';
import { AcademicCapIcon, CurrencyDollarIcon, LightBulbIcon, SparklesIcon } from '@heroicons/react/24/outline';
import { RocketLaunchIcon, StarIcon, ChartBarIcon } from '@heroicons/react/24/solid';

const Landing = () => {
  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-slate-50 via-emerald-50 to-amber-50">
        <div className="absolute top-20 left-20 w-72 h-72 bg-emerald-400/20 rounded-full blur-3xl animate-pulse floating"></div>
        <div className="absolute bottom-40 right-20 w-96 h-96 bg-teal-400/20 rounded-full blur-3xl animate-pulse floating" style={{animationDelay: '2s'}}></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-amber-400/20 rounded-full blur-3xl animate-pulse floating" style={{animationDelay: '4s'}}></div>
      </div>

      <div className="relative z-10">
        {/* Navigation */}
        <nav className="container-custom py-8 backdrop-blur-md bg-white/30 border-b border-white/20 sticky top-0 z-50">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-3 group">
              <div className="bg-gradient-to-br from-emerald-500 to-teal-600 p-2 rounded-2xl shadow-lg group-hover:shadow-2xl transition-all duration-300 pulse-glow">
                <AcademicCapIcon className="h-8 w-8 text-white" />
              </div>
              <span className="text-3xl font-extrabold bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 bg-clip-text text-transparent">
                EduWealth
              </span>
            </div>
            <div className="flex items-center space-x-4">
              <Link to="/login" className="btn btn-secondary">
                Login
              </Link>
              <Link to="/signup" className="btn btn-primary shimmer">
                Get Started →
              </Link>
            </div>
          </div>
        </nav>

        {/* Hero Section */}
        <section className="container-custom py-24 md:py-32">
          <div className="text-center max-w-5xl mx-auto">
            <div className="inline-flex items-center space-x-2 bg-white/80 backdrop-blur-lg px-6 py-3 rounded-full shadow-lg mb-8 border border-white/40 floating">
              <RocketLaunchIcon className="h-5 w-5 text-emerald-600" />
              <span className="text-sm font-semibold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
                🎉 Join 10,000+ Students Investing in Their Future
              </span>
            </div>
            
            <h1 className="text-6xl md:text-7xl lg:text-8xl font-black mb-8 leading-tight">
              <span className="bg-gradient-to-r from-emerald-600 via-teal-500 to-cyan-500 bg-clip-text text-transparent animate-gradient">
                Invest in Your Future
              </span>
              <br />
              <span className="text-gray-900">One Course at a Time</span>
            </h1>
            
            <p className="text-xl md:text-2xl text-gray-700 mb-12 max-w-3xl mx-auto leading-relaxed">
              Skip one burger this month — invest in a course that pays back with <span className="font-bold text-emerald-600">skills, knowledge, and opportunities</span> forever.
            </p>
            
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link to="/signup" className="btn btn-primary text-lg px-10 py-4 group relative overflow-hidden">
                <span className="relative z-10 flex items-center space-x-2">
                  <span>Start Learning Today</span>
                  <RocketLaunchIcon className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
                </span>
              </Link>
              <Link to="/login" className="btn btn-outline text-lg px-10 py-4">
                Explore Courses
              </Link>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-8 mt-20 max-w-3xl mx-auto">
              <div className="text-center">
                <div className="text-4xl font-black bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent mb-2">10K+</div>
                <div className="text-sm text-gray-600 font-medium">Active Students</div>
              </div>
              <div className="text-center">
                <div className="text-4xl font-black bg-gradient-to-r from-teal-600 to-cyan-600 bg-clip-text text-transparent mb-2">500+</div>
                <div className="text-sm text-gray-600 font-medium">Quality Courses</div>
              </div>
              <div className="text-center">
                <div className="text-4xl font-black bg-gradient-to-r from-amber-500 to-orange-500 bg-clip-text text-transparent mb-2">4.9★</div>
                <div className="text-sm text-gray-600 font-medium">Average Rating</div>
              </div>
            </div>
          </div>
        </section>

        {/* Features */}
        <section className="container-custom py-32">
          <div className="text-center mb-16">
            <h2 className="text-5xl font-black text-gray-900 mb-4">
              Why Choose <span className="bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">EduWealth?</span>
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Powerful features designed to help you invest in yourself intelligently
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="card card-3d group p-10 text-center hover:scale-105 transition-all duration-500">
              <div className="relative mb-6">
                <div className="absolute inset-0 bg-gradient-to-br from-emerald-400 to-teal-400 rounded-3xl blur-xl opacity-60 group-hover:opacity-100 transition-opacity"></div>
                <div className="relative inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-3xl shadow-2xl">
                  <LightBulbIcon className="h-10 w-10 text-white" />
                </div>
              </div>
              <h3 className="text-2xl font-bold mb-3 text-gray-900">AI-Powered Matching</h3>
              <p className="text-gray-600 leading-relaxed">
                Our smart algorithm analyzes your interests and finds the <span className="font-semibold text-emerald-600">perfect courses</span> tailored just for you.
              </p>
            </div>

            <div className="card card-3d group p-10 text-center hover:scale-105 transition-all duration-500" style={{transitionDelay: '100ms'}}>
              <div className="relative mb-6">
                <div className="absolute inset-0 bg-gradient-to-br from-amber-400 to-orange-400 rounded-3xl blur-xl opacity-60 group-hover:opacity-100 transition-opacity"></div>
                <div className="relative inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-amber-500 to-orange-500 rounded-3xl shadow-2xl">
                  <CurrencyDollarIcon className="h-10 w-10 text-white" />
                </div>
              </div>
              <h3 className="text-2xl font-bold mb-3 text-gray-900">Budget-Friendly</h3>
              <p className="text-gray-600 leading-relaxed">
                Set your budget and discover courses that fit. We help you <span className="font-semibold text-amber-600">maximize value</span> for every rupee spent.
              </p>
            </div>

            <div className="card card-3d group p-10 text-center hover:scale-105 transition-all duration-500" style={{transitionDelay: '200ms'}}>
              <div className="relative mb-6">
                <div className="absolute inset-0 bg-gradient-to-br from-teal-400 to-cyan-400 rounded-3xl blur-xl opacity-60 group-hover:opacity-100 transition-opacity"></div>
                <div className="relative inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-teal-500 to-cyan-500 rounded-3xl shadow-2xl">
                  <SparklesIcon className="h-10 w-10 text-white" />
                </div>
              </div>
              <h3 className="text-2xl font-bold mb-3 text-gray-900">Smart Insights</h3>
              <p className="text-gray-600 leading-relaxed">
                Track your spending, get <span className="font-semibold text-cyan-600">personalized recommendations</span>, and make informed decisions about your education.
              </p>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="container-custom py-24">
          <div className="relative overflow-hidden gradient-bg rounded-[3rem] p-16 text-center text-white shadow-2xl">
            <div className="absolute top-0 left-0 w-full h-full opacity-20">
              <div className="absolute top-10 left-10 w-32 h-32 bg-white rounded-full blur-2xl"></div>
              <div className="absolute bottom-10 right-10 w-40 h-40 bg-white rounded-full blur-3xl"></div>
            </div>
            
            <div className="relative z-10">
              <div className="inline-flex items-center space-x-2 bg-white/20 backdrop-blur-lg px-6 py-2 rounded-full mb-6">
                <StarIcon className="h-5 w-5 text-yellow-300" />
                <span className="font-semibold">Limited Time Offer!</span>
              </div>
              
              <h2 className="text-5xl md:text-6xl font-black mb-6">
                Ready to Transform<br />Your Future?
              </h2>
              <p className="text-2xl mb-10 opacity-95 max-w-2xl mx-auto">
                Join thousands of students investing in their education wisely and unlock your potential today.
              </p>
              
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <Link to="/signup" className="btn bg-white text-emerald-600 hover:bg-gray-100 px-10 py-4 text-lg font-bold shadow-2xl hover:shadow-3xl transform hover:scale-105">
                  Create Free Account
                </Link>
                <Link to="/login" className="btn bg-white/20 backdrop-blur-lg text-white border-2 border-white/40 hover:bg-white/30 px-10 py-4 text-lg font-bold">
                  Sign In
                </Link>
              </div>

              {/* Trust Indicators */}
              <div className="mt-12 flex items-center justify-center space-x-8 text-white/90">
                <div className="flex items-center space-x-2">
                  <ChartBarIcon className="h-6 w-6" />
                  <span className="font-semibold">100% Free</span>
                </div>
                <div className="flex items-center space-x-2">
                  <StarIcon className="h-6 w-6 text-amber-300" />
                  <span className="font-semibold">No Credit Card</span>
                </div>
                <div className="flex items-center space-x-2">
                  <RocketLaunchIcon className="h-6 w-6" />
                  <span className="font-semibold">Instant Access</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="container-custom py-12 border-t border-gray-200/50 backdrop-blur-sm">
          <div className="text-center">
            <div className="flex items-center justify-center space-x-3 mb-4">
              <div className="bg-gradient-to-br from-emerald-500 to-teal-600 p-2 rounded-xl">
                <AcademicCapIcon className="h-6 w-6 text-white" />
              </div>
              <span className="text-2xl font-bold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
                EduWealth
              </span>
            </div>
            <p className="text-gray-600 text-lg">
              Built with <span className="text-red-500">❤️</span> for students who invest in their future.
            </p>
            <p className="text-gray-500 mt-2">© 2025 EduWealth. All rights reserved.</p>
          </div>
        </footer>
      </div>
    </div>
  );
};

export default Landing;
