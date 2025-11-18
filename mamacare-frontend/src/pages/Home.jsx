import { Link } from 'react-router-dom';
import useAuthStore from '../store/authStore';

export default function Home() {
  const { isAuthenticated } = useAuthStore();

  return (
    <div className="min-h-screen bg-gradient-to-b from-pink-50 to-white">
      <div className="container mx-auto px-4 py-20 text-center">
        <h1 className="text-5xl font-bold text-gray-800 mb-4">Welcome to MamaCare</h1>
        <p className="text-xl text-gray-600 mb-8">
          Your comprehensive maternal health and wellness companion
        </p>

        {isAuthenticated ? (
          <Link
            to="/dashboard"
            className="bg-pink-600 text-white px-8 py-3 rounded-lg text-lg font-semibold hover:bg-pink-700 inline-block"
          >
            Go to Dashboard
          </Link>
        ) : (
          <div className="flex gap-4 justify-center">
            <Link
              to="/login"
              className="bg-pink-600 text-white px-8 py-3 rounded-lg text-lg font-semibold hover:bg-pink-700"
            >
              Login
            </Link>
            <Link
              to="/register"
              className="bg-white text-pink-600 border-2 border-pink-600 px-8 py-3 rounded-lg text-lg font-semibold hover:bg-pink-50"
            >
              Register
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
