import React from "react";
import { Task } from "../../../types/Task";

interface WorkerPerformanceProps {
  tasks: Task[];
}

const WorkerPerformance: React.FC<WorkerPerformanceProps> = ({ tasks }) => {
  return (
    <div>
      {/* TODO: Implement worker performance visualization */}
      <p>Worker Performance Chart (Coming Soon)</p>
    </div>
  );
};

export default WorkerPerformance;
