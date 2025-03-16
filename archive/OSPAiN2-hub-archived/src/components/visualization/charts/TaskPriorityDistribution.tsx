import React from "react";
import { Task } from "../../../types/Task";

export interface TaskPriorityDistributionProps {
  tasks?: Task[];
  data?: Array<{
    priority: string;
    count: number;
  }>;
}

const TaskPriorityDistribution: React.FC<TaskPriorityDistributionProps> = ({
  tasks,
  data,
}) => {
  // Component can receive either processed data or raw tasks
  return (
    <div>
      {/* TODO: Implement task priority distribution visualization */}
      <p>Task Priority Distribution Chart (Coming Soon)</p>
    </div>
  );
};

export default TaskPriorityDistribution;
