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
import TaskManager from "./pages/TaskManager";
import ErrorBoundary from "./components/ErrorBoundary";

/**
 * Main App Component
 *
 * Sets up the routing structure and wraps the application with
 * the necessary providers for state management.
 */
const App: React.FC = () => {
  return (
    <ErrorBoundary>
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
            <Route
              index
              element={
                <ErrorBoundary>
                  <Dashboard />
                </ErrorBoundary>
              }
            />
            <Route
              path="rate-limit-manager"
              element={
                <ErrorBoundary>
                  <RateLimitManager />
                </ErrorBoundary>
              }
            />
            <Route
              path="rate-limit-demo"
              element={
                <ErrorBoundary>
                  <RateLimitDemo />
                </ErrorBoundary>
              }
            />
            <Route
              path="tool-manager"
              element={
                <ErrorBoundary>
                  <ToolManager />
                </ErrorBoundary>
              }
            />
            <Route
              path="agent-demo"
              element={
                <ErrorBoundary>
                  <AgentDemo />
                </ErrorBoundary>
              }
            />
            <Route
              path="knowledge-graph"
              element={
                <ErrorBoundary>
                  <KnowledgeGraph />
                </ErrorBoundary>
              }
            />
            <Route
              path="progress-dashboard"
              element={
                <ErrorBoundary>
                  <ProgressDashboard />
                </ErrorBoundary>
              }
            />
            <Route
              path="task-manager"
              element={
                <ErrorBoundary>
                  <TaskManager />
                </ErrorBoundary>
              }
            />
            <Route
              path="worker-demo"
              element={
                <ErrorBoundary>
                  <WorkerDemo />
                </ErrorBoundary>
              }
            />
            <Route
              path="settings"
              element={
                <ErrorBoundary>
                  <Settings />
                </ErrorBoundary>
              }
            />
            <Route
              path="debug"
              element={
                <ErrorBoundary>
                  <DebugDashboard />
                </ErrorBoundary>
              }
            />
            <Route
              path="component-manager"
              element={
                <ErrorBoundary>
                  <ComponentManagerPage />
                </ErrorBoundary>
              }
            />
          </Route>
        </Routes>
      </RateLimitProvider>
    </ErrorBoundary>
  );
};

export default App;
