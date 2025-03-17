import React, { useState } from 'react';
import { ToolCall, ToolCallStatus } from '../../types/toolcalls';

interface ToolCallItemProps {
  toolCall: ToolCall;
  index: number;
  isExpanded?: boolean;
}

export const ToolCallItem: React.FC<ToolCallItemProps> = ({ 
  toolCall, 
  index,
  isExpanded: initialExpanded = false
}) => {
  const [isExpanded, setIsExpanded] = useState(initialExpanded);
  
  const getStatusColor = (status: ToolCallStatus): string => {
    switch (status) {
      case ToolCallStatus.COMPLETED:
        return 'text-green-500';
      case ToolCallStatus.FAILED:
        return 'text-red-500';
      case ToolCallStatus.IN_PROGRESS:
        return 'text-blue-500';
      case ToolCallStatus.PENDING:
        return 'text-yellow-500';
      case ToolCallStatus.CANCELLED:
        return 'text-gray-500';
      default:
        return 'text-gray-700';
    }
  };

  const getStatusIcon = (status: ToolCallStatus): string => {
    switch (status) {
      case ToolCallStatus.COMPLETED:
        return '✓';
      case ToolCallStatus.FAILED:
        return '✗';
      case ToolCallStatus.IN_PROGRESS:
        return '⟳';
      case ToolCallStatus.PENDING:
        return '⏱';
      case ToolCallStatus.CANCELLED:
        return '⊝';
      default:
        return '?';
    }
  };

  const formatTimestamp = (timestamp: number): string => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString();
  };

  const formatDuration = (duration?: number): string => {
    if (!duration) return 'N/A';
    if (duration < 1000) return `${duration}ms`;
    return `${(duration / 1000).toFixed(2)}s`;
  };

  const toggleExpand = () => {
    setIsExpanded(!isExpanded);
  };

  return (
    <div className="border-b border-gray-200 py-2">
      <div 
        className="flex items-center justify-between cursor-pointer hover:bg-gray-50 px-2 py-1 rounded"
        onClick={toggleExpand}
      >
        <div className="flex items-center">
          <span className="text-gray-500 w-8">{index + 1}.</span>
          <span className={`mr-2 ${getStatusColor(toolCall.status)}`}>
            {getStatusIcon(toolCall.status)}
          </span>
          <span className="font-medium">{toolCall.name}</span>
        </div>
        <div className="flex items-center text-sm text-gray-500">
          <span className="mr-4">{formatTimestamp(toolCall.timestamp)}</span>
          {toolCall.duration && <span>{formatDuration(toolCall.duration)}</span>}
          <span className="ml-2">{isExpanded ? '▼' : '▶'}</span>
        </div>
      </div>
      
      {isExpanded && (
        <div className="bg-gray-50 p-2 rounded mt-1 text-sm overflow-x-auto">
          {toolCall.parameters && (
            <div className="mb-2">
              <div className="font-medium text-gray-700 mb-1">Parameters:</div>
              <pre className="bg-gray-100 p-2 rounded text-xs overflow-x-auto">
                {JSON.stringify(toolCall.parameters, null, 2)}
              </pre>
            </div>
          )}
          
          {toolCall.result && (
            <div className="mb-2">
              <div className="font-medium text-gray-700 mb-1">Result:</div>
              <pre className="bg-gray-100 p-2 rounded text-xs overflow-x-auto">
                {typeof toolCall.result === 'object' 
                  ? JSON.stringify(toolCall.result, null, 2) 
                  : toolCall.result.toString()}
              </pre>
            </div>
          )}
          
          {toolCall.error && (
            <div className="mb-2">
              <div className="font-medium text-red-500 mb-1">Error:</div>
              <pre className="bg-red-50 text-red-600 p-2 rounded text-xs overflow-x-auto">
                {toolCall.error}
              </pre>
            </div>
          )}
          
          <div className="text-xs text-gray-500 flex justify-between mt-2">
            <div>ID: {toolCall.id}</div>
            <div>Status: {toolCall.status}</div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ToolCallItem; 