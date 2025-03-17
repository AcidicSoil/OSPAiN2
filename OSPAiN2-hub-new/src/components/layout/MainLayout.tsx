import { Outlet } from 'react-router-dom';
import { useEffect } from 'react';
import Header from './Header';
import Sidebar from './Sidebar';
import { useLogger } from '../../utils/logger';

const MainLayout = () => {
  const logger = useLogger('MainLayout');
  
  useEffect(() => {
    logger.info('Main layout rendered');
    
    logger.startTimer('layoutRender');
    
    return () => {
      logger.endTimer('layoutRender', 2, 'Layout render completed');
    };
  }, [logger]);
  
  return (
    <div className="flex h-screen bg-gray-50 dark:bg-gray-900">
      <Sidebar />
      <div className="flex flex-col flex-1 overflow-hidden">
        <Header />
        <main className="flex-1 overflow-auto p-4">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default MainLayout; 