import React, { useState } from "react";
import { TaskDashboard } from "../components/TaskDashboard";
import { TaskPriority, TaskType } from "../types/Task";
import { TaskUtils } from "../utils/TaskUtils";

/**
 * Worker System Demo
 *
 * This page demonstrates how to use the Task and Worker system by providing
 * a simple interface to create various types of tasks and view their progress.
 */
export const WorkerDemo: React.FC = () => {
  // State for demo controls
  const [taskType, setTaskType] = useState<TaskType>(TaskType.MODEL_REQUEST);
  const [taskPriority, setTaskPriority] = useState<TaskPriority>(
    TaskPriority.MEDIUM
  );
  const [taskCount, setTaskCount] = useState<number>(1);
  const [showDashboard, setShowDashboard] = useState<boolean>(true);

  // State for task-specific fields
  const [modelPrompt, setModelPrompt] = useState<string>(
    "Generate a short poem about artificial intelligence"
  );
  const [modelId, setModelId] = useState<string>("gpt-3.5-turbo");

  const [embeddingTexts, setEmbeddingTexts] = useState<string>(
    "AI is transforming how we work\nWorkers need new skills\nAutomation is changing industries"
  );
  const [embeddingDimensions, setEmbeddingDimensions] = useState<number>(384);

  const [fileOperation, setFileOperation] = useState<string>("read");
  const [filePath, setFilePath] = useState<string>("/path/to/file.txt");

  const [processorName, setProcessorName] = useState<string>("text-analyzer");
  const [processorData, setProcessorData] = useState<string>(
    "This is some sample text that needs to be processed. It will be analyzed for sentiment, entities, and keywords."
  );

  const [apiUrl, setApiUrl] = useState<string>("https://api.example.com/data");
  const [apiMethod, setApiMethod] = useState<string>("GET");

  const [customType, setCustomType] = useState<string>("image-generation");
  const [customData, setCustomData] = useState<string>(
    '{"prompt": "A futuristic city with flying cars", "style": "photorealistic", "dimensions": {"width": 1024, "height": 768}}'
  );

  /**
   * Create tasks based on selected type and count
   */
  const handleCreateTasks = async () => {
    const tasks = [];

    for (let i = 0; i < taskCount; i++) {
      let taskId;

      switch (taskType) {
        case TaskType.MODEL_REQUEST:
          taskId = await createModelTask();
          break;
        case TaskType.EMBEDDINGS:
          taskId = await createEmbeddingsTask();
          break;
        case TaskType.FILE_OPERATION:
          taskId = await createFileTask();
          break;
        case TaskType.DATA_PROCESSING:
          taskId = await createDataProcessingTask();
          break;
        case TaskType.EXTERNAL_API:
          taskId = await createApiTask();
          break;
        case TaskType.CUSTOM:
          taskId = await createCustomTask();
          break;
      }

      tasks.push(taskId);
    }

    alert(`Created ${tasks.length} tasks successfully!`);
  };

  /**
   * Create a model request task
   */
  const createModelTask = async () => {
    return await TaskUtils.createModelRequest(modelPrompt, modelId, {
      priority: taskPriority,
      tags: ["demo", "model-task"],
    });
  };

  /**
   * Create an embeddings task
   */
  const createEmbeddingsTask = async () => {
    // Split text into an array by newlines
    const texts = embeddingTexts
      .split("\n")
      .filter((text) => text.trim() !== "");

    return await TaskUtils.createEmbeddingsTask(texts, embeddingDimensions, {
      priority: taskPriority,
      tags: ["demo", "embeddings-task"],
    });
  };

  /**
   * Create a file operation task
   */
  const createFileTask = async () => {
    return await TaskUtils.createFileOperation(
      fileOperation as "read" | "write" | "delete" | "copy" | "move",
      filePath,
      undefined,
      fileOperation === "write"
        ? "Sample content to write to the file."
        : undefined,
      {
        priority: taskPriority,
        tags: ["demo", "file-task", fileOperation],
      }
    );
  };

  /**
   * Create a data processing task
   */
  const createDataProcessingTask = async () => {
    return await TaskUtils.createDataProcessingTask(
      processorName,
      processorData,
      processorData.length,
      {
        priority: taskPriority,
        tags: ["demo", "processing-task", processorName],
      }
    );
  };

  /**
   * Create an external API task
   */
  const createApiTask = async () => {
    return await TaskUtils.createExternalApiTask(
      apiUrl,
      apiMethod as "GET" | "POST" | "PUT" | "DELETE" | "PATCH",
      {
        "Content-Type": "application/json",
        Authorization: "Bearer demo-api-key",
      },
      apiMethod !== "GET"
        ? { sampleData: "This would be the request body" }
        : undefined,
      {
        priority: taskPriority,
        tags: ["demo", "api-task", apiMethod.toLowerCase()],
      }
    );
  };

  /**
   * Create a custom task
   */
  const createCustomTask = async () => {
    let parsedData;
    try {
      parsedData = JSON.parse(customData);
    } catch (e) {
      // If not valid JSON, use as string
      parsedData = { text: customData };
    }

    return await TaskUtils.createCustomTask(customType, parsedData, {
      priority: taskPriority,
      tags: ["demo", "custom-task", customType],
      maxAttempts: 2,
    });
  };

  // Render the appropriate form fields based on selected task type
  const renderTaskTypeFields = () => {
    switch (taskType) {
      case TaskType.MODEL_REQUEST:
        return (
          <>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Prompt
              </label>
              <textarea
                rows={4}
                className="w-full p-2 border rounded-lg"
                value={modelPrompt}
                onChange={(e) => setModelPrompt(e.target.value)}
              />
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Model ID
              </label>
              <input
                type="text"
                className="w-full p-2 border rounded-lg"
                value={modelId}
                onChange={(e) => setModelId(e.target.value)}
              />
            </div>
          </>
        );

      case TaskType.EMBEDDINGS:
        return (
          <>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Texts to Embed (one per line)
              </label>
              <textarea
                rows={4}
                className="w-full p-2 border rounded-lg"
                value={embeddingTexts}
                onChange={(e) => setEmbeddingTexts(e.target.value)}
              />
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Embedding Dimensions
              </label>
              <input
                type="number"
                className="w-full p-2 border rounded-lg"
                value={embeddingDimensions}
                onChange={(e) =>
                  setEmbeddingDimensions(parseInt(e.target.value))
                }
              />
            </div>
          </>
        );

      case TaskType.FILE_OPERATION:
        return (
          <>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Operation
              </label>
              <select
                className="w-full p-2 border rounded-lg"
                value={fileOperation}
                onChange={(e) => setFileOperation(e.target.value)}
              >
                <option value="read">Read</option>
                <option value="write">Write</option>
                <option value="delete">Delete</option>
                <option value="copy">Copy</option>
                <option value="move">Move</option>
              </select>
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                File Path
              </label>
              <input
                type="text"
                className="w-full p-2 border rounded-lg"
                value={filePath}
                onChange={(e) => setFilePath(e.target.value)}
              />
            </div>
          </>
        );

      case TaskType.DATA_PROCESSING:
        return (
          <>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Processor Name
              </label>
              <input
                type="text"
                className="w-full p-2 border rounded-lg"
                value={processorName}
                onChange={(e) => setProcessorName(e.target.value)}
              />
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Data to Process
              </label>
              <textarea
                rows={4}
                className="w-full p-2 border rounded-lg"
                value={processorData}
                onChange={(e) => setProcessorData(e.target.value)}
              />
            </div>
          </>
        );

      case TaskType.EXTERNAL_API:
        return (
          <>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                API URL
              </label>
              <input
                type="text"
                className="w-full p-2 border rounded-lg"
                value={apiUrl}
                onChange={(e) => setApiUrl(e.target.value)}
              />
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                HTTP Method
              </label>
              <select
                className="w-full p-2 border rounded-lg"
                value={apiMethod}
                onChange={(e) => setApiMethod(e.target.value)}
              >
                <option value="GET">GET</option>
                <option value="POST">POST</option>
                <option value="PUT">PUT</option>
                <option value="DELETE">DELETE</option>
                <option value="PATCH">PATCH</option>
              </select>
            </div>
          </>
        );

      case TaskType.CUSTOM:
        return (
          <>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Custom Task Type
              </label>
              <input
                type="text"
                className="w-full p-2 border rounded-lg"
                value={customType}
                onChange={(e) => setCustomType(e.target.value)}
              />
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Custom Data (JSON or text)
              </label>
              <textarea
                rows={4}
                className="w-full p-2 border rounded-lg font-mono"
                value={customData}
                onChange={(e) => setCustomData(e.target.value)}
              />
            </div>
          </>
        );

      default:
        return null;
    }
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-6">Worker System Demo</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Task Creation Panel */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg shadow p-4">
            <h2 className="text-xl font-semibold mb-4">Create Tasks</h2>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Task Type
              </label>
              <select
                className="w-full p-2 border rounded-lg"
                value={taskType}
                onChange={(e) => setTaskType(e.target.value as TaskType)}
              >
                {Object.values(TaskType).map((type) => (
                  <option key={type} value={type}>
                    {type
                      .split("_")
                      .map(
                        (word) => word.charAt(0).toUpperCase() + word.slice(1)
                      )
                      .join(" ")}
                  </option>
                ))}
              </select>
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Priority
              </label>
              <select
                className="w-full p-2 border rounded-lg"
                value={taskPriority}
                onChange={(e) =>
                  setTaskPriority(Number(e.target.value) as TaskPriority)
                }
              >
                {Object.entries(TaskPriority)
                  .filter(([key]) => isNaN(Number(key)))
                  .map(([key, value]) => (
                    <option key={key} value={value}>
                      {key}
                    </option>
                  ))}
              </select>
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Number of Tasks to Create
              </label>
              <input
                type="number"
                min="1"
                max="10"
                className="w-full p-2 border rounded-lg"
                value={taskCount}
                onChange={(e) => setTaskCount(Number(e.target.value))}
              />
            </div>

            {renderTaskTypeFields()}

            <button
              onClick={handleCreateTasks}
              className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Create {taskCount} Task{taskCount !== 1 ? "s" : ""}
            </button>
          </div>

          <div className="mt-4 bg-white rounded-lg shadow p-4">
            <h2 className="text-xl font-semibold mb-4">Documentation</h2>
            <div className="prose">
              <p>
                This demo showcases the Worker System, which provides a scalable
                way to process tasks asynchronously using worker threads.
              </p>
              <p className="mt-2">
                Create tasks of different types using the form above, then watch
                the dashboard to see them processed in real-time. Tasks are
                prioritized based on their priority level.
              </p>
              <p className="mt-2">
                The system automatically scales the number of worker threads
                based on workload and can recover from worker crashes.
              </p>
            </div>
          </div>
        </div>

        {/* Task Dashboard Panel */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-lg shadow mb-4 p-4">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold">Task Dashboard</h2>
              <button
                onClick={() => setShowDashboard(!showDashboard)}
                className="px-3 py-1 bg-gray-200 text-gray-700 rounded hover:bg-gray-300"
              >
                {showDashboard ? "Hide" : "Show"} Dashboard
              </button>
            </div>
          </div>

          {showDashboard && <TaskDashboard refreshInterval={1000} />}
        </div>
      </div>
    </div>
  );
};
