import { Link } from 'react-router-dom';

const NotFoundPage = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 flex items-center justify-center p-4">
      <div className="text-center max-w-md">
        {/* Title */}
        <title>Page Not Found - 404</title>

        {/* Error Code */}
        <h1 className="text-9xl font-bold text-blue-600 mb-4 animate-bounce">404</h1>

        {/* Error Message */}
        <h2 className="text-2xl font-semibold text-gray-800 mb-2">Page Not Found</h2>
        <p className="text-gray-600 mb-6">
          Oops! The page you're looking for doesn't exist or has been moved.
        </p>

        {/* Dashboard Link */}
        <Link
          to="/dashboard"
          className="inline-block px-6 py-3 bg-blue-600 text-white rounded-lg 
          hover:bg-blue-700 transition-colors duration-200 font-medium"
        >
          Go to Dashboard
        </Link>
      </div>
    </div>
  );
};

export default NotFoundPage;