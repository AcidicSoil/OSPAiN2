import React from 'react';

const TasksPage = () => {
  return (
    <div className="pt-16 pl-20 md:pl-64">
      <div className="p-6">
        <h1 className="text-2xl font-bold text-gray-800 dark:text-white mb-6">Tasks</h1>
        
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-16 w-16 mx-auto text-gray-400 dark:text-gray-600 mb-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"
                />
              </svg>
              <h2 className="text-xl font-semibold text-gray-700 dark:text-gray-300 mb-2">
                Task Management System
              </h2>
              <p className="text-gray-500 dark:text-gray-400 max-w-md">
                This page will contain the Task Management System interface, allowing you to create, monitor, and manage tasks for your agents and workflows.
              </p>
              <button className="mt-6 px-6 py-2 bg-primary-500 hover:bg-primary-600 text-white font-medium rounded-md transition-colors">
                Coming Soon
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TasksPage; 