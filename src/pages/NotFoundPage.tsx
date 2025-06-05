
import React from 'react';
import { Link } from 'react-router-dom';
import { AlertCircle } from 'lucide-react';

const NotFoundPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="max-w-md w-full text-center">
        <AlertCircle className="mx-auto h-12 w-12 text-gray-400" />
        <h1 className="mt-4 text-3xl font-bold text-gray-900">Page Not Found</h1>
        <p className="mt-2 text-gray-600">
          The page you're looking for doesn't exist or the short link may have expired.
        </p>
        <div className="mt-6">
          <Link
            to="/"
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            Go Back Home
          </Link>
        </div>
      </div>
    </div>
  );
};

export default NotFoundPage;
