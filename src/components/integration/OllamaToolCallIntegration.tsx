import React, { useEffect, useState } from 'react';
import toolCallService from '../../services/toolCallService';
import { ToolCallBubble } from '../visualization/ToolCallBubble';

// Declare VS Code API for TypeScript
declare global {
  interface Window {
    acquireVsCodeApi?: () => {
      postMessage: (message: any) => void;
      getState: () => any;
      setState: (state: any) => void;
    };
  }
}

/**
 * OllamaToolCallIntegration Component
 * Integrates tool call monitoring UI with OllamaOS and VS Code/Cursor
 */
export const OllamaToolCallIntegration: React.FC<{
  showInChat?: boolean;
  position?: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left';
  theme?: 'light' | 'dark';
}> = ({ 
  showInChat = true,
  position = 'bottom-right',
  theme = 'light'
}) => {
  const [isVSCode, setIsVSCode] = useState(false);
  const [vscode, setVscode] = useState<any>(null);
  
  useEffect(() => {
    // Check if running in VS Code
    if (typeof window !== 'undefined' && window.acquireVsCodeApi) {
      const api = window.acquireVsCodeApi();
      setVscode(api);
      setIsVSCode(true);
    }
    
    // Setup VS Code message listener if applicable
    const handleVSCodeMessage = (event: MessageEvent) => {
      const message = event.data;
      
      // Handle tool call events from VS Code
      if (message.type === 'tool-call') {
        const { name, parameters } = message.data;
        const id = toolCallService.trackCall(name, parameters);
        
        // Send acknowledgment back to VS Code
        if (vscode) {
          vscode.postMessage({
            type: 'tool-call-tracked',
            data: { id, name }
          });
        }
      }
      
      // Handle tool call updates from VS Code
      if (message.type === 'tool-call-update') {
        const { id, status, result, error } = message.data;
        toolCallService.updateCallStatus(id, status, result, error);
      }
    };
    
    if (isVSCode) {
      window.addEventListener('message', handleVSCodeMessage);
      
      // Tell VS Code we're ready
      if (vscode) {
        vscode.postMessage({ type: 'tool-call-ui-ready' });
      }
    }
    
    return () => {
      if (isVSCode) {
        window.removeEventListener('message', handleVSCodeMessage);
      }
    };
  }, [isVSCode, vscode]);
  
  // If tool call integration is not needed, render nothing
  if (!showInChat) {
    return null;
  }
  
  const handleClearHistory = () => {
    toolCallService.clearSession();
    
    // Notify VS Code
    if (isVSCode && vscode) {
      vscode.postMessage({ type: 'tool-call-cleared' });
    }
  };
  
  return (
    <ToolCallBubble
      position={position}
      theme={theme}
      onClearHistory={handleClearHistory}
    />
  );
};

export default OllamaToolCallIntegration; 