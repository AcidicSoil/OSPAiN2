import React from "react";
import { Task } from "../../../types/Task";

interface TaskTimelineProps {
  tasks: Task[];
}

const TaskTimeline: React.FC<TaskTimelineProps> = ({ tasks }) => {
  return (
    <div>
      {/* TODO: Implement task timeline visualization */}
      <p>Task Timeline Chart (Coming Soon)</p>
    </div>
  );
};

export default TaskTimeline;
