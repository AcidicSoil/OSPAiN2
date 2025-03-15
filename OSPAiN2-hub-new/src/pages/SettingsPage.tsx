import React from 'react';

const SettingsPage = () => {
  return (
    <div className="pt-16 pl-20 md:pl-64">
      <div className="p-6">
        <h1 className="text-2xl font-bold text-gray-800 dark:text-white mb-6">Settings</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {/* Settings Menu */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
            <h2 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">Settings Menu</h2>
            <nav>
              <ul className="space-y-2">
                <li>
                  <button className="w-full text-left px-4 py-2 rounded-md bg-primary-100 dark:bg-primary-900 text-primary-600 dark:text-primary-400 font-medium">
                    General
                  </button>
                </li>
                <li>
                  <button className="w-full text-left px-4 py-2 rounded-md text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700">
                    Appearance
                  </button>
                </li>
                <li>
                  <button className="w-full text-left px-4 py-2 rounded-md text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700">
                    T2P Engine
                  </button>
                </li>
                <li>
                  <button className="w-full text-left px-4 py-2 rounded-md text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700">
                    Agents
                  </button>
                </li>
                <li>
                  <button className="w-full text-left px-4 py-2 rounded-md text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700">
                    Security
                  </button>
                </li>
                <li>
                  <button className="w-full text-left px-4 py-2 rounded-md text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700">
                    Advanced
                  </button>
                </li>
              </ul>
            </nav>
          </div>
          
          {/* Settings Content */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 md:col-span-3">
            <h2 className="text-lg font-semibold text-gray-800 dark:text-white mb-6">General Settings</h2>
            
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  System Name
                </label>
                <input
                  type="text"
                  className="w-full px-4 py-2 rounded-md bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-primary-500"
                  placeholder="OSPAiN2-Hub"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  API Endpoint
                </label>
                <input
                  type="text"
                  className="w-full px-4 py-2 rounded-md bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-primary-500"
                  placeholder="http://localhost:8000/api"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Default Language
                </label>
                <select className="w-full px-4 py-2 rounded-md bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-primary-500">
                  <option>English</option>
                  <option>Spanish</option>
                  <option>French</option>
                  <option>German</option>
                  <option>Japanese</option>
                </select>
              </div>
              
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="notifications"
                  className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                />
                <label htmlFor="notifications" className="ml-2 block text-sm text-gray-700 dark:text-gray-300">
                  Enable Notifications
                </label>
              </div>
              
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="analytics"
                  className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                />
                <label htmlFor="analytics" className="ml-2 block text-sm text-gray-700 dark:text-gray-300">
                  Enable Analytics
                </label>
              </div>
              
              <div className="pt-4 flex justify-end space-x-4">
                <button className="px-6 py-2 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 font-medium rounded-md transition-colors">
                  Cancel
                </button>
                <button className="px-6 py-2 bg-primary-500 hover:bg-primary-600 text-white font-medium rounded-md transition-colors">
                  Save Changes
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsPage; 