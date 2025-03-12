import React from "react";
import { Task } from "../../../types/Task";

interface TaskTagsProps {
  tasks: Task[];
}

const TaskTags: React.FC<TaskTagsProps> = ({ tasks }) => {
  return (
    <div>
      {/* TODO: Implement task tags visualization */}
      <p>Task Tags Chart (Coming Soon)</p>
    </div>
  );
};

export default TaskTags;
