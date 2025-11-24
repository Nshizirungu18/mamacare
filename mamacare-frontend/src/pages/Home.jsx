import { Link } from 'react-router-dom';
import useAuthStore from '../store/authStore';
import welcomeImage from '../assets/pexels-helenalopes-4409091.jpg';

export default function Home() {
  const { isAuthenticated } = useAuthStore();

  return (
    <div className="min-h-screen bg-gradient-to-b from-pink-50 to-white">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
          {/* Left: Image */}
          <div className="order-2 lg:order-1">
            <img
              src={welcomeImage}
              alt="Pregnant woman"
              className="w-full h-auto rounded-lg shadow-lg object-cover"
            />
          </div>

          {/* Right: Content */}
          <div className="order-1 lg:order-2 text-center lg:text-left">
            <h1 className="text-5xl font-bold text-gray-800 mb-4">
              Welcome to MamaCare
            </h1>
            <p className="text-xl text-gray-600 mb-6">
              Your comprehensive maternal health and wellness companion
            </p>
            <p className="text-gray-500 mb-8">
              Track your pregnancy journey, connect with other mothers, and access
              essential healthcare resources all in one place.
            </p>

            {isAuthenticated ? (
              <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                <Link
                  to="/dashboard"
                  className="bg-pink-600 text-white px-8 py-3 rounded-lg text-lg font-semibold hover:bg-pink-700 transition inline-block text-center"
                >
                  Go to Dashboard
                </Link>
                <Link
                  to="/community"
                  className="bg-blue-500 text-white px-8 py-3 rounded-lg text-lg font-semibold hover:bg-blue-600 transition inline-block text-center"
                >
                  Join Community
                </Link>
              </div>
            ) : (
              <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                <Link
                  to="/login"
                  className="bg-pink-600 text-white px-8 py-3 rounded-lg text-lg font-semibold hover:bg-pink-700 transition text-center"
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  className="bg-white text-pink-600 border-2 border-pink-600 px-8 py-3 rounded-lg text-lg font-semibold hover:bg-pink-50 transition text-center"
                >
                  Register
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* Features Section */}
        <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-lg shadow-md text-center">
            <div className="text-4xl mb-3">📊</div>
            <h3 className="text-xl font-semibold mb-2">Track Your Journey</h3>
            <p className="text-gray-600">
              Monitor your pregnancy progress, wellness logs, and important milestones
            </p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-md text-center">
            <div className="text-4xl mb-3">👥</div>
            <h3 className="text-xl font-semibold mb-2">Connect & Share</h3>
            <p className="text-gray-600">
              Join a supportive community of mothers sharing experiences and advice
            </p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-md text-center">
            <div className="text-4xl mb-3">🏥</div>
            <h3 className="text-xl font-semibold mb-2">Find Care</h3>
            <p className="text-gray-600">
              Discover nearby clinics and healthcare providers for your needs
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
