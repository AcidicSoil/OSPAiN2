import { useState, useEffect } from 'react';

// Mock data for demonstration
const mockSystemStatus = {
  cpu: 32,
  memory: 45,
  activeModels: 3,
  services: [
    { name: 'T2P Engine', status: 'healthy' },
    { name: 'Agent Service', status: 'healthy' },
    { name: 'Task Manager', status: 'warning' },
  ],
};

const mockAgentStatus = {
  activeAgents: 5,
  recentCompetitions: 12,
  agentHealth: 'good',
  topAgent: 'Agent-GPT-4',
};

const mockActivities = [
  { id: 1, type: 'task', message: 'Task "Data Analysis" completed', time: '5 min ago' },
  { id: 2, type: 'agent', message: 'New agent "CodeAssistant" created', time: '15 min ago' },
  { id: 3, type: 'system', message: 'System update completed', time: '1 hour ago' },
  { id: 4, type: 'competition', message: 'Competition #123 finished', time: '2 hours ago' },
  { id: 5, type: 'task', message: 'Task "Code Review" started', time: '3 hours ago' },
];

const mockPerformanceData = {
  systemLoad: [32, 45, 23, 56, 78, 54, 65, 43, 23, 45, 67, 54],
  agentPerformance: [78, 65, 82, 75, 68, 92, 85, 79, 88, 95, 89, 92],
  resourceUsage: [45, 56, 67, 54, 43, 32, 45, 56, 67, 78, 65, 54],
};

const mockNotifications = [
  { id: 1, type: 'info', message: 'System update available', time: '5 min ago', read: false },
  { id: 2, type: 'warning', message: 'Task Manager service needs attention', time: '15 min ago', read: false },
  { id: 3, type: 'success', message: 'Agent competition completed successfully', time: '1 hour ago', read: true },
  { id: 4, type: 'error', message: 'Failed to connect to external API', time: '2 hours ago', read: true },
];

const Dashboard = () => {
  const [systemStatus, setSystemStatus] = useState(mockSystemStatus);
  const [agentStatus, setAgentStatus] = useState(mockAgentStatus);
  const [activities, setActivities] = useState(mockActivities);
  const [performanceData, setPerformanceData] = useState(mockPerformanceData);
  const [notifications, setNotifications] = useState(mockNotifications);
  
  // In a real application, you would fetch this data from an API
  useEffect(() => {
    // Fetch data here
    // Example:
    // const fetchData = async () => {
    //   const systemData = await api.getSystemStatus();
    //   setSystemStatus(systemData);
    //   // ... fetch other data
    // };
    // fetchData();
  }, []);
  
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'healthy':
        return 'bg-green-500';
      case 'warning':
        return 'bg-yellow-500';
      case 'error':
        return 'bg-red-500';
      default:
        return 'bg-gray-500';
    }
  };
  
  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'info':
        return (
          <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center text-blue-500 dark:text-blue-300">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
            </svg>
          </div>
        );
      case 'warning':
        return (
          <div className="w-8 h-8 rounded-full bg-yellow-100 dark:bg-yellow-900 flex items-center justify-center text-yellow-500 dark:text-yellow-300">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
          </div>
        );
      case 'success':
        return (
          <div className="w-8 h-8 rounded-full bg-green-100 dark:bg-green-900 flex items-center justify-center text-green-500 dark:text-green-300">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
          </div>
        );
      case 'error':
        return (
          <div className="w-8 h-8 rounded-full bg-red-100 dark:bg-red-900 flex items-center justify-center text-red-500 dark:text-red-300">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
          </div>
        );
      default:
        return null;
    }
  };
  
  return (
    <div className="pt-16 pl-20 md:pl-64">
      <div className="p-6">
        <h1 className="text-2xl font-bold text-gray-800 dark:text-white mb-6">Dashboard</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          {/* System Status Card */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
            <h2 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">System Status</h2>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between mb-1">
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">CPU Usage</span>
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{systemStatus.cpu}%</span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                  <div className="bg-primary-500 h-2 rounded-full" style={{ width: `${systemStatus.cpu}%` }}></div>
                </div>
              </div>
              
              <div>
                <div className="flex justify-between mb-1">
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Memory Usage</span>
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{systemStatus.memory}%</span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                  <div className="bg-primary-500 h-2 rounded-full" style={{ width: `${systemStatus.memory}%` }}></div>
                </div>
              </div>
              
              <div className="flex justify-between">
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Active Models</span>
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{systemStatus.activeModels}</span>
              </div>
              
              <div>
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Services</span>
                <div className="mt-2 space-y-2">
                  {systemStatus.services.map((service) => (
                    <div key={service.name} className="flex items-center justify-between">
                      <span className="text-sm text-gray-600 dark:text-gray-400">{service.name}</span>
                      <div className="flex items-center">
                        <div className={`w-2 h-2 rounded-full ${getStatusColor(service.status)} mr-2`}></div>
                        <span className="text-xs capitalize">{service.status}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
          
          {/* Agent Status Card */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
            <h2 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">Agent Status</h2>
            <div className="space-y-4">
              <div className="flex justify-between">
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Active Agents</span>
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{agentStatus.activeAgents}</span>
              </div>
              
              <div className="flex justify-between">
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Recent Competitions</span>
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{agentStatus.recentCompetitions}</span>
              </div>
              
              <div className="flex justify-between">
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Agent Health</span>
                <span className="text-sm font-medium text-green-500 capitalize">{agentStatus.agentHealth}</span>
              </div>
              
              <div className="flex justify-between">
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Top Performing Agent</span>
                <span className="text-sm font-medium text-primary-500">{agentStatus.topAgent}</span>
              </div>
              
              <div className="pt-4">
                <button className="w-full py-2 px-4 bg-primary-500 hover:bg-primary-600 text-white font-medium rounded-md transition-colors">
                  View All Agents
                </button>
              </div>
            </div>
          </div>
          
          {/* Recent Activities Card */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
            <h2 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">Recent Activities</h2>
            <div className="space-y-4">
              {activities.slice(0, 4).map((activity) => (
                <div key={activity.id} className="flex items-start">
                  <div className="w-2 h-2 mt-2 rounded-full bg-primary-500 mr-3"></div>
                  <div>
                    <p className="text-sm text-gray-700 dark:text-gray-300">{activity.message}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">{activity.time}</p>
                  </div>
                </div>
              ))}
              
              <div className="pt-2">
                <button className="w-full py-2 px-4 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 font-medium rounded-md transition-colors">
                  View All Activities
                </button>
              </div>
            </div>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          {/* Performance Metrics Card */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
            <h2 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">Performance Metrics</h2>
            <div className="h-64 flex items-center justify-center">
              <div className="text-center text-gray-500 dark:text-gray-400">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
                <p>Performance chart will be displayed here</p>
                <p className="text-sm mt-2">Showing system load, agent performance, and resource usage</p>
              </div>
            </div>
          </div>
          
          {/* Quick Actions Card */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
            <h2 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">Quick Actions</h2>
            <div className="grid grid-cols-2 gap-4">
              <button className="p-4 bg-primary-50 dark:bg-primary-900 hover:bg-primary-100 dark:hover:bg-primary-800 text-primary-600 dark:text-primary-300 rounded-lg transition-colors flex flex-col items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                <span className="text-sm font-medium">New Task</span>
              </button>
              
              <button className="p-4 bg-secondary-50 dark:bg-secondary-900 hover:bg-secondary-100 dark:hover:bg-secondary-800 text-secondary-600 dark:text-secondary-300 rounded-lg transition-colors flex flex-col items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
                <span className="text-sm font-medium">Create Agent</span>
              </button>
              
              <button className="p-4 bg-accent-50 dark:bg-accent-900 hover:bg-accent-100 dark:hover:bg-accent-800 text-accent-600 dark:text-accent-300 rounded-lg transition-colors flex flex-col items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                </svg>
                <span className="text-sm font-medium">Run Competition</span>
              </button>
              
              <button className="p-4 bg-gray-50 dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 text-gray-600 dark:text-gray-300 rounded-lg transition-colors flex flex-col items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                <span className="text-sm font-medium">Settings</span>
              </button>
            </div>
          </div>
        </div>
        
        {/* Notification Center Card */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
          <h2 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">Notification Center</h2>
          <div className="space-y-4">
            {notifications.map((notification) => (
              <div key={notification.id} className={`flex items-start p-3 rounded-lg ${notification.read ? 'bg-gray-50 dark:bg-gray-700' : 'bg-blue-50 dark:bg-blue-900'}`}>
                {getNotificationIcon(notification.type)}
                <div className="ml-3 flex-1">
                  <p className={`text-sm font-medium ${notification.read ? 'text-gray-700 dark:text-gray-300' : 'text-gray-900 dark:text-white'}`}>
                    {notification.message}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{notification.time}</p>
                </div>
                <button className="text-gray-400 hover:text-gray-500 dark:text-gray-500 dark:hover:text-gray-400">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </button>
              </div>
            ))}
            
            <div className="pt-2">
              <button className="w-full py-2 px-4 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 font-medium rounded-md transition-colors">
                View All Notifications
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard; 