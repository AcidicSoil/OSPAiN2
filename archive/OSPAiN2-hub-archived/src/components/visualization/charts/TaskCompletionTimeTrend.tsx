import React from "react";
import { Task } from "../../../types/Task";

export interface TaskCompletionTimeTrendProps {
  tasks?: Task[];
  data?: Array<{
    date: Date;
    completedTasks: number;
  }>;
}

const TaskCompletionTimeTrend: React.FC<TaskCompletionTimeTrendProps> = ({
  tasks,
  data,
}) => {
  // Component can receive either processed data or raw tasks
  return (
    <div>
      {/* TODO: Implement task completion time trend visualization */}
      <p>Task Completion Time Trend Chart (Coming Soon)</p>
    </div>
  );
};

export default TaskCompletionTimeTrend;
