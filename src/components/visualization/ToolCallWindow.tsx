import React, { useEffect, useState } from 'react';
import toolCallService from '../../services/toolCallService';
import { ToolCallFilterOptions, ToolCallStatus, ToolCallWindowProps } from '../../types/toolcalls';
import ToolCallItem from './ToolCallItem';

/**
 * Tool Call Window Component
 * Displays real-time tool call logs and analytics in an expandable window
 */
export const ToolCallWindow: React.FC<ToolCallWindowProps> = ({
  maxCalls = 25,
  onClearHistory,
  onFilterChange,
  collapsed: initialCollapsed = false,
  showAnalytics = true,
  height = '400px',
  width = '100%'
}) => {
  const [session, setSession] = useState(toolCallService.getSession());
  const [collapsed, setCollapsed] = useState(initialCollapsed);
  const [filter, setFilter] = useState<ToolCallFilterOptions>({});
  const [expandedCallIds, setExpandedCallIds] = useState<Set<string>>(new Set());
  
  useEffect(() => {
    // Subscribe to tool call service updates
    const unsubscribe = toolCallService.addListener((updatedSession) => {
      setSession({ ...updatedSession });
    });
    
    return () => {
      unsubscribe();
    };
  }, []);

  const handleClearHistory = () => {
    toolCallService.clearSession();
    if (onClearHistory) {
      onClearHistory();
    }
  };

  const handleFilterChange = (newFilter: Partial<ToolCallFilterOptions>) => {
    const updatedFilter = { ...filter, ...newFilter };
    setFilter(updatedFilter);
    
    if (onFilterChange) {
      onFilterChange(updatedFilter);
    }
  };

  const toggleCollapse = () => {
    setCollapsed(!collapsed);
  };

  const toggleExpandAll = () => {
    if (expandedCallIds.size > 0) {
      setExpandedCallIds(new Set());
    } else {
      const allIds = new Set(session.toolCalls.map(call => call.id));
      setExpandedCallIds(allIds);
    }
  };

  const getProgressColor = () => {
    const { totalCalls } = session;
    const percentUsed = (totalCalls / maxCalls) * 100;
    
    if (percentUsed >= 80) return 'bg-red-500';
    if (percentUsed >= 60) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  // Calculate progress and status
  const percentComplete = Math.min(100, (session.totalCalls / maxCalls) * 100);
  const progressColor = getProgressColor();
  const isNearLimit = session.totalCalls >= maxCalls * 0.8;

  const headerClasses = `
    flex items-center justify-between
    px-3 py-2 rounded-t border-b
    ${isNearLimit ? 'bg-red-50 border-red-200' : 'bg-gray-50 border-gray-200'}
    cursor-pointer transition-colors duration-200
  `;

  // If collapsed, render only the header
  if (collapsed) {
    return (
      <div className="border rounded shadow-sm" style={{ width }}>
        <div className={headerClasses} onClick={toggleCollapse}>
          <div className="flex items-center">
            <span className="font-medium">
              🔧 Tool Calls
            </span>
            <span className="ml-2 text-sm">
              {session.totalCalls}/{maxCalls}
            </span>
            {isNearLimit && (
              <span className="ml-2 text-xs text-red-600 font-medium">
                ⚠️ Approaching limit
              </span>
            )}
          </div>
          <span className="text-gray-500">▼</span>
        </div>
      </div>
    );
  }

  return (
    <div className="border rounded shadow-sm" style={{ width }}>
      <div className={headerClasses} onClick={toggleCollapse}>
        <div className="flex items-center">
          <span className="font-medium">
            🔧 Tool Calls
          </span>
          <span className="ml-2 text-sm">
            {session.totalCalls}/{maxCalls}
          </span>
          {isNearLimit && (
            <span className="ml-2 text-xs text-red-600 font-medium">
              ⚠️ Approaching limit
            </span>
          )}
        </div>
        <span className="text-gray-500">▲</span>
      </div>

      <div className="p-2">
        <div className="w-full bg-gray-200 rounded-full h-2 mb-3">
          <div 
            className={`${progressColor} h-2 rounded-full transition-all duration-300 ease-out`} 
            style={{ width: `${percentComplete}%` }}
          ></div>
        </div>
        
        <div className="flex flex-wrap gap-2 mb-3">
          <select 
            className="text-sm border rounded p-1"
            value={filter.status ? filter.status[0] : 'all'}
            onChange={(e) => {
              const value = e.target.value;
              handleFilterChange({ 
                status: value === 'all' ? undefined : [value as ToolCallStatus] 
              });
            }}
          >
            <option value="all">All Statuses</option>
            <option value={ToolCallStatus.COMPLETED}>Completed</option>
            <option value={ToolCallStatus.FAILED}>Failed</option>
            <option value={ToolCallStatus.IN_PROGRESS}>In Progress</option>
            <option value={ToolCallStatus.PENDING}>Pending</option>
          </select>
          
          <input 
            type="text"
            placeholder="Search..."
            className="text-sm border rounded p-1 flex-grow"
            value={filter.search || ''}
            onChange={(e) => handleFilterChange({ search: e.target.value })}
          />
          
          <button 
            className="text-sm bg-gray-200 hover:bg-gray-300 rounded px-2 py-1 transition-colors"
            onClick={toggleExpandAll}
          >
            {expandedCallIds.size > 0 ? 'Collapse All' : 'Expand All'}
          </button>
          
          <button 
            className="text-sm bg-red-100 hover:bg-red-200 rounded px-2 py-1 transition-colors"
            onClick={handleClearHistory}
          >
            Clear
          </button>
        </div>
        
        <div 
          className="overflow-y-auto border rounded" 
          style={{ height, maxHeight: height }}
        >
          {session.toolCalls.length === 0 ? (
            <div className="text-center text-gray-500 p-4">
              No tool calls recorded yet
            </div>
          ) : (
            session.toolCalls.map((call, index) => (
              <ToolCallItem 
                key={call.id} 
                toolCall={call} 
                index={index} 
                isExpanded={expandedCallIds.has(call.id)}
              />
            ))
          )}
        </div>
        
        {showAnalytics && session.toolCalls.length > 0 && (
          <div className="mt-3 p-2 bg-gray-50 rounded text-sm">
            <h4 className="font-medium mb-1">Analytics</h4>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <div className="text-gray-600">Success Rate:</div>
                <div>{(session.completedCalls / session.totalCalls * 100).toFixed(1)}%</div>
              </div>
              <div>
                <div className="text-gray-600">Failure Rate:</div>
                <div>{(session.failedCalls / session.totalCalls * 100).toFixed(1)}%</div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ToolCallWindow; 