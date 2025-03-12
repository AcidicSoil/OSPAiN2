import React from "react";
import { Routes, Route } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Layout from "./components/layout/Layout";
import Dashboard from "./pages/Dashboard";
import RateLimitManager from "./pages/RateLimitManager";
import RateLimitDemo from "./pages/RateLimitDemo";
import ToolManager from "./pages/ToolManager";
import AgentDemo from "./pages/AgentDemo";
import KnowledgeGraph from "./pages/KnowledgeGraph";
import Settings from "./pages/Settings";
import ProgressDashboard from "./pages/ProgressDashboard";
import { RateLimitProvider } from "./context/RateLimitContext";
import { WorkerDemo } from "./pages/WorkerDemo";
import DebugDashboard from "./pages/DebugDashboard";
import ComponentManagerPage from "./pages/ComponentManagerPage";

/**
 * Main App Component
 *
 * Sets up the routing structure and wraps the application with
 * the necessary providers for state management.
 */
const App: React.FC = () => {
  return (
    <RateLimitProvider>
      <ToastContainer
        position="bottom-right"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
      />
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Dashboard />} />
          <Route path="rate-limit-manager" element={<RateLimitManager />} />
          <Route path="rate-limit-demo" element={<RateLimitDemo />} />
          <Route path="tool-manager" element={<ToolManager />} />
          <Route path="agent-demo" element={<AgentDemo />} />
          <Route path="knowledge-graph" element={<KnowledgeGraph />} />
          <Route path="progress-dashboard" element={<ProgressDashboard />} />
          <Route path="worker-demo" element={<WorkerDemo />} />
          <Route path="settings" element={<Settings />} />
          <Route path="debug" element={<DebugDashboard />} />
          <Route path="component-manager" element={<ComponentManagerPage />} />
        </Route>
      </Routes>
    </RateLimitProvider>
  );
};

export default App;
