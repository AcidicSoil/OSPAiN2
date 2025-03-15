import React from 'react';
import { Link } from 'react-router-dom';

const NotFoundPage = () => {
  return (
    <div className="pt-16 pl-20 md:pl-64">
      <div className="p-6">
        <div className="flex flex-col items-center justify-center h-[calc(100vh-200px)]">
          <div className="text-center">
            <h1 className="text-9xl font-bold text-primary-500 dark:text-primary-400">404</h1>
            <h2 className="text-3xl font-semibold text-gray-800 dark:text-white mt-4 mb-6">
              Page Not Found
            </h2>
            <p className="text-gray-600 dark:text-gray-400 max-w-md mx-auto mb-8">
              The page you are looking for might have been removed, had its name changed, or is temporarily unavailable.
            </p>
            <Link
              to="/"
              className="px-6 py-3 bg-primary-500 hover:bg-primary-600 text-white font-medium rounded-md transition-colors inline-block"
            >
              Go to Dashboard
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NotFoundPage; 