import React from 'react';
import { TodoManager } from '../components/todo/TodoManager';

const TasksPage = () => {
  return (
    <div className="pt-16 pl-20 md:pl-64">
      <div className="p-6">
        <h1 className="text-2xl font-bold text-gray-800 dark:text-white mb-6">Tasks</h1>
        
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
          <TodoManager />
        </div>
      </div>
    </div>
  );
};

export default TasksPage; 