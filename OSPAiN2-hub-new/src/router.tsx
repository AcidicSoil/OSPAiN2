import { Routes, Route } from 'react-router-dom';
import MainLayout from './components/layout/MainLayout';
import Dashboard from './pages/Dashboard';
import T2PPage from './pages/T2PPage';
import AgentsPage from './pages/AgentsPage';
import TasksPage from './pages/TasksPage';
import SettingsPage from './pages/SettingsPage';
import NotFoundPage from './pages/NotFoundPage';
import { KnowledgeGraphPage } from './pages/KnowledgeGraphPage';

const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={<MainLayout />}>
        <Route index element={<Dashboard />} />
        <Route path="t2p" element={<T2PPage />} />
        <Route path="agents" element={<AgentsPage />} />
        <Route path="tasks" element={<TasksPage />} />
        <Route path="knowledge-graph" element={<KnowledgeGraphPage />} />
        <Route path="settings" element={<SettingsPage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Route>
    </Routes>
  );
};

export default AppRoutes; 