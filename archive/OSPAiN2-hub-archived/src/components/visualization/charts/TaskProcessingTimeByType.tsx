import React from "react";
import { Task } from "../../../types/Task";
import { ProcessingTimeData } from "../../../utils/chartDataTransformers";

export interface TaskProcessingTimeByTypeProps {
  tasks?: Task[];
  data?: ProcessingTimeData[];
}

const TaskProcessingTimeByType: React.FC<TaskProcessingTimeByTypeProps> = ({
  tasks,
  data,
}) => {
  // Component can receive either processed data or raw tasks
  return (
    <div>
      {/* TODO: Implement task processing time by type visualization */}
      <p>Task Processing Time by Type Chart (Coming Soon)</p>
    </div>
  );
};

export default TaskProcessingTimeByType;
