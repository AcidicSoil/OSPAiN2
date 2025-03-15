import { useState, useRef, useEffect } from 'react';

// Mock data for demonstration
const mockSuggestions = [
  { id: 1, command: 'npm run build', description: 'Build the project for production' },
  { id: 2, command: 'git status', description: 'Check the status of the git repository' },
  { id: 3, command: 'docker-compose up', description: 'Start all services defined in docker-compose.yml' },
];

const mockHistory = [
  { id: 1, command: 'npm install', status: 'success', time: '5 min ago' },
  { id: 2, command: 'git pull origin main', status: 'success', time: '10 min ago' },
  { id: 3, command: 'npm test', status: 'error', time: '15 min ago' },
  { id: 4, command: 'ls -la', status: 'success', time: '20 min ago' },
];

const T2PPage = () => {
  const [command, setCommand] = useState('');
  const [suggestions, setSuggestions] = useState(mockSuggestions);
  const [history, setHistory] = useState(mockHistory);
  const [output, setOutput] = useState('');
  const [isExecuting, setIsExecuting] = useState(false);
  const [executionTime, setExecutionTime] = useState(0);
  const [executionStatus, setExecutionStatus] = useState<'idle' | 'running' | 'success' | 'error'>('idle');
  
  const outputRef = useRef<HTMLDivElement>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  
  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, []);
  
  useEffect(() => {
    if (outputRef.current) {
      outputRef.current.scrollTop = outputRef.current.scrollHeight;
    }
  }, [output]);
  
  const handleCommandChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCommand(e.target.value);
    // In a real application, you would fetch suggestions based on the command
  };
  
  const handleCommandSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!command.trim() || isExecuting) return;
    
    // Simulate command execution
    setIsExecuting(true);
    setExecutionStatus('running');
    setExecutionTime(0);
    
    // Start timer
    timerRef.current = setInterval(() => {
      setExecutionTime(prev => prev + 0.1);
    }, 100);
    
    // Simulate output generation
    setOutput('');
    const outputLines = [
      `> ${command}`,
      '',
      '# Executing command...',
    ];
    
    let lineIndex = 0;
    const outputInterval = setInterval(() => {
      if (lineIndex < outputLines.length) {
        setOutput(prev => prev + outputLines[lineIndex] + '\n');
        lineIndex++;
      } else {
        clearInterval(outputInterval);
        
        // Simulate command completion after a random time
        setTimeout(() => {
          const isSuccess = Math.random() > 0.2; // 80% chance of success
          
          if (isSuccess) {
            setOutput(prev => prev + '\n# Command executed successfully\n');
            setExecutionStatus('success');
            
            // Add to history
            setHistory(prev => [
              {
                id: Date.now(),
                command,
                status: 'success',
                time: 'just now',
              },
              ...prev,
            ]);
          } else {
            setOutput(prev => prev + '\n# Error: Command execution failed\n');
            setExecutionStatus('error');
            
            // Add to history
            setHistory(prev => [
              {
                id: Date.now(),
                command,
                status: 'error',
                time: 'just now',
              },
              ...prev,
            ]);
          }
          
          setIsExecuting(false);
          if (timerRef.current) {
            clearInterval(timerRef.current);
          }
        }, Math.random() * 2000 + 1000); // Random time between 1-3 seconds
      }
    }, 100);
  };
  
  const handleSuggestionClick = (suggestion: typeof mockSuggestions[0]) => {
    setCommand(suggestion.command);
  };
  
  const handleHistoryClick = (historyItem: typeof mockHistory[0]) => {
    setCommand(historyItem.command);
  };
  
  return (
    <div className="pt-16 pl-20 md:pl-64">
      <div className="p-6">
        <h1 className="text-2xl font-bold text-gray-800 dark:text-white mb-6">T2P Engine</h1>
        
        <div className="grid grid-cols-1 gap-6">
          {/* Command Input */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
            <form onSubmit={handleCommandSubmit} className="flex items-center">
              <input
                type="text"
                value={command}
                onChange={handleCommandChange}
                placeholder="Enter command..."
                className="flex-1 px-4 py-2 rounded-md bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-primary-500"
                disabled={isExecuting}
              />
              <button
                type="submit"
                className={`ml-4 px-6 py-2 rounded-md font-medium ${
                  isExecuting
                    ? 'bg-gray-400 dark:bg-gray-600 cursor-not-allowed'
                    : 'bg-primary-500 hover:bg-primary-600 text-white'
                }`}
                disabled={isExecuting}
              >
                {isExecuting ? 'Executing...' : 'Execute'}
              </button>
            </form>
          </div>
          
          {/* Suggestion Panel */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
            <h2 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">Suggestions</h2>
            <div className="space-y-3">
              {suggestions.map((suggestion) => (
                <div
                  key={suggestion.id}
                  className="p-3 bg-gray-50 dark:bg-gray-700 rounded-md hover:bg-gray-100 dark:hover:bg-gray-600 cursor-pointer transition-colors"
                  onClick={() => handleSuggestionClick(suggestion)}
                >
                  <div className="font-medium text-primary-600 dark:text-primary-400">{suggestion.command}</div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">{suggestion.description}</div>
                </div>
              ))}
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Execution Status */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
              <h2 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">Execution Status</h2>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Status</span>
                  <span className={`text-sm font-medium ${
                    executionStatus === 'idle' ? 'text-gray-500' :
                    executionStatus === 'running' ? 'text-yellow-500' :
                    executionStatus === 'success' ? 'text-green-500' :
                    'text-red-500'
                  }`}>
                    {executionStatus === 'idle' ? 'Idle' :
                     executionStatus === 'running' ? 'Running' :
                     executionStatus === 'success' ? 'Success' :
                     'Error'}
                  </span>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Execution Time</span>
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    {executionTime.toFixed(1)}s
                  </span>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Current Command</span>
                  <span className="text-sm font-medium text-primary-500">
                    {isExecuting ? command : 'None'}
                  </span>
                </div>
                
                {isExecuting && (
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 mt-2">
                    <div className="bg-primary-500 h-2 rounded-full animate-pulse"></div>
                  </div>
                )}
              </div>
            </div>
            
            {/* Command History */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
              <h2 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">Command History</h2>
              <div className="space-y-3 max-h-60 overflow-y-auto">
                {history.map((item) => (
                  <div
                    key={item.id}
                    className="p-3 bg-gray-50 dark:bg-gray-700 rounded-md hover:bg-gray-100 dark:hover:bg-gray-600 cursor-pointer transition-colors flex items-center justify-between"
                    onClick={() => handleHistoryClick(item)}
                  >
                    <div>
                      <div className="font-medium text-gray-800 dark:text-gray-200">{item.command}</div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">{item.time}</div>
                    </div>
                    <div className={`w-2 h-2 rounded-full ${
                      item.status === 'success' ? 'bg-green-500' : 'bg-red-500'
                    }`}></div>
                  </div>
                ))}
              </div>
            </div>
          </div>
          
          {/* Output Console */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-800 dark:text-white">Output Console</h2>
              <button
                onClick={() => setOutput('')}
                className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
              </button>
            </div>
            <div
              ref={outputRef}
              className="bg-gray-900 text-gray-200 font-mono text-sm p-4 rounded-md h-64 overflow-y-auto whitespace-pre"
            >
              {output || '# Ready for command execution\n# Type a command and press Execute'}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default T2PPage; 