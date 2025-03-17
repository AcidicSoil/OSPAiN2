import React, { useEffect, useState } from 'react';
import toolCallService from '../../services/toolCallService';
import { ToolCall, ToolCallWindowProps } from '../../types/toolcalls';

/**
 * Tool Call Bubble Component
 * A compact, floating bubble for visualizing tool calls in chat windows
 */
const ToolCallBubble: React.FC<Omit<ToolCallWindowProps, 'height' | 'width'> & {
  position?: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left';
  offset?: number;
  floating?: boolean;
  theme?: 'light' | 'dark';
}> = ({
  maxCalls = 25,
  onClearHistory,
  collapsed: initialCollapsed = true,
  position = 'bottom-right',
  offset = 20,
  floating = true,
  theme = 'light',
}) => {
  const [session, setSession] = useState(toolCallService.getSession());
  const [collapsed, setCollapsed] = useState(initialCollapsed);
  const [hovered, setHovered] = useState(false);
  
  useEffect(() => {
    // Subscribe to tool call service updates
    const unsubscribe = toolCallService.addListener((updatedSession) => {
      setSession({ ...updatedSession });
    });
    
    return () => {
      unsubscribe();
    };
  }, []);

  // Determine positioning classes
  const getPositionClasses = () => {
    switch (position) {
      case 'top-right':
        return `top-${offset}px right-${offset}px`;
      case 'top-left':
        return `top-${offset}px left-${offset}px`;
      case 'bottom-left':
        return `bottom-${offset}px left-${offset}px`;
      case 'bottom-right':
      default:
        return `bottom-${offset}px right-${offset}px`;
    }
  };

  // Determine theme-based classes
  const getThemeClasses = () => {
    return theme === 'dark' 
      ? 'bg-gray-800 text-white border-gray-700'
      : 'bg-white text-gray-800 border-gray-200';
  };

  // Calculate status
  const percentComplete = Math.min(100, (session.totalCalls / maxCalls) * 100);
  const isNearLimit = session.totalCalls >= maxCalls * 0.8;
  const isAtLimit = session.totalCalls >= maxCalls;
  
  // Status color
  const getStatusColor = () => {
    if (isAtLimit) return theme === 'dark' ? 'text-red-400' : 'text-red-600';
    if (isNearLimit) return theme === 'dark' ? 'text-yellow-300' : 'text-yellow-600';
    return theme === 'dark' ? 'text-green-400' : 'text-green-500';
  };

  // Container classes
  const containerClasses = `
    rounded-lg shadow-lg border z-50 transition-all duration-200
    ${getThemeClasses()}
    ${floating ? `fixed ${getPositionClasses()}` : 'inline-block'}
    ${hovered ? 'shadow-xl' : ''}
  `;

  // Handle on click
  const handleClick = () => {
    setCollapsed(!collapsed);
  };

  // Simplified display of recent tool calls
  const getRecentCalls = (): ToolCall[] => {
    return [...session.toolCalls].reverse().slice(0, 5);
  };

  return (
    <div 
      className={containerClasses}
      style={{ 
        maxWidth: collapsed ? '180px' : '300px',
        minWidth: collapsed ? '60px' : '250px'
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* Header - Always visible */}
      <div 
        className={`flex items-center justify-between p-2 cursor-pointer rounded-t-lg
          ${isNearLimit ? (theme === 'dark' ? 'bg-yellow-900' : 'bg-yellow-50') : ''}
        `}
        onClick={handleClick}
      >
        <div className="flex items-center">
          <span className="font-medium flex-shrink-0">🔧</span>
          {(!collapsed || hovered) && (
            <span className="ml-1 font-medium">
              Tool Calls
            </span>
          )}
        </div>
        <div className="flex items-center">
          <span className={`text-xs font-mono ${getStatusColor()}`}>
            {session.totalCalls}/{maxCalls}
          </span>
          <span className="ml-1">
            {collapsed ? '▼' : '▲'}
          </span>
        </div>
      </div>

      {/* Progress Bar - Always visible */}
      <div className={`h-1 w-full ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-200'}`}>
        <div 
          className={`h-1 transition-all duration-300 ease-out ${
            isAtLimit ? 'bg-red-500' : 
            isNearLimit ? 'bg-yellow-500' : 
            'bg-green-500'
          }`}
          style={{ width: `${percentComplete}%` }}
        ></div>
      </div>

      {/* Expanded Content */}
      {!collapsed && (
        <div className="p-2">
          <div className="text-xs font-medium mb-1">Recent Tool Calls:</div>
          <div className={`overflow-y-auto max-h-40 ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'} border rounded`}>
            {session.toolCalls.length === 0 ? (
              <div className="text-center text-xs p-2 opacity-75">No tool calls yet</div>
            ) : (
              <ul className="divide-y divide-gray-200">
                {getRecentCalls().map((call) => (
                  <li key={call.id} className="px-2 py-1 text-xs hover:bg-opacity-10 hover:bg-gray-500">
                    <div className="flex justify-between">
                      <span className="font-medium truncate max-w-[150px]">{call.name}</span>
                      <span className={`
                        ${call.status === 'completed' ? (theme === 'dark' ? 'text-green-400' : 'text-green-600') : ''}
                        ${call.status === 'failed' ? (theme === 'dark' ? 'text-red-400' : 'text-red-600') : ''}
                        ${call.status === 'in-progress' ? (theme === 'dark' ? 'text-blue-400' : 'text-blue-600') : ''}
                      `}>
                        {call.status === 'completed' ? '✓' : 
                         call.status === 'failed' ? '✗' : 
                         call.status === 'in-progress' ? '⟳' : '⏱'}
                      </span>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
          
          <div className="flex justify-between items-center mt-2">
            <div className="text-xs opacity-75">
              {session.completedCalls} completed, {session.failedCalls} failed
            </div>
            <button 
              className={`text-xs px-2 py-1 rounded ${
                theme === 'dark' ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-200 hover:bg-gray-300'
              }`}
              onClick={onClearHistory}
            >
              Clear
            </button>
          </div>
        </div>
      )}

      {/* Warning Badge for Near Limit - Only when collapsed */}
      {collapsed && isNearLimit && (
        <div className={`absolute -top-2 -right-2 rounded-full w-5 h-5 flex items-center justify-center ${
          isAtLimit ? 'bg-red-500' : 'bg-yellow-500'
        }`}>
          <span className="text-white text-xs">!</span>
        </div>
      )}
    </div>
  );
};

export default ToolCallBubble; 