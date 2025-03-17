/**
 * Sovereign Agent Framework - React UI Components
 * Part of Horizon 3 (Future) implementation for Ollama Ecosystem.
 * 
 * @context: Connected to agent-creed.js for core functionality
 * @context: Provides React components for building UIs with the Sovereign Agent framework
 */

import React, { createContext, useContext, useEffect, useRef, useState } from 'react';

// Context for Sovereign Agent CreedProvider
const CreedContext = createContext(null);

/**
 * Provider component that makes the Sovereign Agent available to child components
 */
export function CreedProvider({ 
  creed,
  reflectionFrequency = 10, 
  virtueThreshold = 0.7, 
  introspectionDepth = 3,
  children 
}) {
  // Initialize creed if not provided
  const [creedInstance] = useState(() => {
    if (creed) return creed;
    
    // If we're in a browser environment, we need to dynamically import
    if (typeof window !== 'undefined') {
      // This assumes the SovereignAgentCreed is available as a global or via import
      const { SovereignAgentCreed } = window.SovereignAgent || {};
      return new SovereignAgentCreed({
        reflectionFrequency,
        virtueThreshold,
        introspectionDepth
      });
    }
    
    return null;
  });
  
  // Pass the creed instance through context
  return (
    <CreedContext.Provider value={creedInstance}>
      {children}
    </CreedContext.Provider>
  );
}

/**
 * Hook to use the Sovereign Agent creed in components
 */
export function useCreed() {
  const creed = useContext(CreedContext);
  
  if (!creed) {
    throw new Error('useCreed must be used within a CreedProvider');
  }
  
  return {
    // Core functions
    evaluateDecision: (proposedAction, alternatives = []) => 
      creed.evaluateDecision(proposedAction, alternatives),
    generateContextualCreed: (situation) => 
      creed.generateContextualCreed(situation),
    processError: (error) => 
      creed.processError(error),
    enhanceWithContext: (response) => 
      creed.enhanceWithContext(response),
    performReflection: () => 
      creed.performReflection(),
    recordInteraction: (interaction) => 
      creed.recordInteraction(interaction),
    
    // Access to core data
    getReflectionLog: () => creed.reflectionLog || [],
    getCorePrinciples: () => creed.corePrinciples(),
    getContextAnchors: () => creed.contextAnchors || []
  };
}

/**
 * Chat message component
 */
function ChatMessage({ message, isUser }) {
  return (
    <div className={`chat-message ${isUser ? 'user-message' : 'agent-message'}`}>
      <div className="message-avatar">
        {isUser ? '👤' : '🧠'}
      </div>
      <div className="message-content">
        {message}
      </div>
    </div>
  );
}

/**
 * Button with Socratic styling
 */
export function SocraticButton({ onClick, children, type = 'primary', disabled = false }) {
  const buttonTypes = {
    primary: 'socratic-btn-primary',
    secondary: 'socratic-btn-secondary',
    tertiary: 'socratic-btn-tertiary',
    danger: 'socratic-btn-danger'
  };
  
  const buttonClass = buttonTypes[type] || buttonTypes.primary;
  
  return (
    <button 
      className={`socratic-btn ${buttonClass} ${disabled ? 'socratic-btn-disabled' : ''}`}
      onClick={onClick}
      disabled={disabled}
    >
      {children}
    </button>
  );
}

/**
 * Virtue alignment display component
 */
export function VirtueAlignment({ alignment }) {
  if (!alignment) return null;
  
  const { score, primaryVirtue, weakestVirtue, byVirtue = {} } = alignment;
  
  return (
    <div className="virtue-alignment">
      <div className="virtue-score">
        Overall: {(score * 100).toFixed(1)}%
      </div>
      <div className="virtue-summary">
        <div>Primary virtue: <span className="primary-virtue">{primaryVirtue}</span></div>
        <div>Needs work: <span className="weakest-virtue">{weakestVirtue}</span></div>
      </div>
      <div className="virtue-bars">
        {Object.entries(byVirtue).map(([virtue, value]) => (
          <div key={virtue} className="virtue-bar-container">
            <div className="virtue-name">{virtue}</div>
            <div className="virtue-bar-wrapper">
              <div 
                className="virtue-bar" 
                style={{ width: `${value * 100}%` }}
                data-value={`${(value * 100).toFixed(0)}%`}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/**
 * Chat window with Sovereign Agent integration and custom buttons
 */
export function SovereignChatWindow({
  initialMessages = [],
  onSendMessage,
  customButtons = [],
  showVirtueAlignment = true,
  showTypingIndicator = true,
  showTimestamp = true,
  theme = 'light'
}) {
  const creed = useCreed();
  const [messages, setMessages] = useState(initialMessages);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [virtueAlignment, setVirtueAlignment] = useState(null);
  const messagesEndRef = useRef(null);
  
  // Auto-scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);
  
  // Handle sending a message
  const handleSend = async () => {
    if (!inputValue.trim()) return;
    
    // Add user message
    const userMessage = inputValue.trim();
    setMessages(prev => [...prev, { 
      content: userMessage, 
      isUser: true,
      timestamp: new Date()
    }]);
    setInputValue('');
    setIsTyping(true);
    
    try {
      // If onSendMessage callback is provided, use it
      if (onSendMessage) {
        const response = await onSendMessage(userMessage);
        setMessages(prev => [...prev, { 
          content: response, 
          isUser: false,
          timestamp: new Date()
        }]);
      } else {
        // Default behavior: enhance with context
        const enhancedResponse = await creed.enhanceWithContext(
          `Thank you for your message: "${userMessage}". I'll do my best to respond thoughtfully.`
        );
        
        setMessages(prev => [...prev, { 
          content: enhancedResponse, 
          isUser: false,
          timestamp: new Date()
        }]);
      }
    } catch (error) {
      // Handle errors
      const errorRecovery = creed.processError(error);
      setMessages(prev => [...prev, { 
        content: `I encountered an error, but let me respond with wisdom: ${errorRecovery.acceptance}`, 
        isUser: false,
        timestamp: new Date(),
        isError: true
      }]);
    } finally {
      setIsTyping(false);
    }
  };
  
  // Handle evaluating the current conversation
  const handleEvaluate = async () => {
    if (messages.length === 0) return;
    
    // Get the last message content
    const lastMessage = messages[messages.length - 1];
    if (lastMessage.isUser) return; // Only evaluate agent messages
    
    setIsTyping(true);
    
    try {
      // Evaluate the last agent message
      const decision = await creed.evaluateDecision(lastMessage.content);
      setVirtueAlignment(decision.virtueAlignment);
      
      // Add evaluation message
      setMessages(prev => [...prev, { 
        content: `I've reflected on my last message. ${
          decision.isAligned 
            ? "I believe it was aligned with virtue."
            : "I see opportunities to improve its virtue alignment."
        } ${decision.recommendations.length > 0 
          ? "I could improve by: " + decision.recommendations.join("; ") 
          : ""}`, 
        isUser: false,
        timestamp: new Date(),
        isEvaluation: true
      }]);
    } catch (error) {
      console.error("Error evaluating message:", error);
    } finally {
      setIsTyping(false);
    }
  };
  
  // Handle generating a contextual creed
  const handleGenerateCreed = async () => {
    setIsTyping(true);
    
    try {
      // Generate creed for current conversation context
      const situation = "this conversation about " + 
        (messages.length > 0 
          ? messages[messages.length - 1].content.substring(0, 50) + "..." 
          : "our potential interaction");
      
      const contextualCreed = await creed.generateContextualCreed(situation);
      
      // Add creed message
      setMessages(prev => [...prev, { 
        content: `Here is a guiding principle for our conversation:\n\n"${contextualCreed}"`, 
        isUser: false,
        timestamp: new Date(),
        isCreed: true
      }]);
    } catch (error) {
      console.error("Error generating creed:", error);
    } finally {
      setIsTyping(false);
    }
  };
  
  // Handle performing a reflection
  const handleReflect = async () => {
    if (messages.length < 2) return; // Need at least some interaction
    
    setIsTyping(true);
    
    try {
      // Perform reflection
      const reflection = await creed.performReflection();
      
      // Add reflection message
      setMessages(prev => [...prev, { 
        content: `I've reflected on our conversation. ${reflection.patterns}\n\n${reflection.improvement}\n\n"${reflection.philosophicalInsight}"`, 
        isUser: false,
        timestamp: new Date(),
        isReflection: true
      }]);
    } catch (error) {
      console.error("Error performing reflection:", error);
    } finally {
      setIsTyping(false);
    }
  };
  
  return (
    <div className={`sovereign-chat-window theme-${theme}`}>
      <div className="chat-header">
        <h3>Sovereign Agent</h3>
        <div className="header-actions">
          {/* Additional header actions can go here */}
        </div>
      </div>
      
      <div className="chat-messages">
        {messages.map((msg, index) => (
          <div key={index} className="message-wrapper">
            <ChatMessage 
              message={msg.content} 
              isUser={msg.isUser} 
            />
            {showTimestamp && msg.timestamp && (
              <div className="message-timestamp">
                {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </div>
            )}
          </div>
        ))}
        
        {isTyping && showTypingIndicator && (
          <div className="typing-indicator">
            <span></span>
            <span></span>
            <span></span>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>
      
      {showVirtueAlignment && virtueAlignment && (
        <div className="virtue-alignment-container">
          <VirtueAlignment alignment={virtueAlignment} />
        </div>
      )}
      
      <div className="chat-actions">
        <SocraticButton onClick={handleEvaluate} type="secondary">
          Evaluate
        </SocraticButton>
        <SocraticButton onClick={handleGenerateCreed} type="secondary">
          Generate Creed
        </SocraticButton>
        <SocraticButton onClick={handleReflect} type="secondary">
          Reflect
        </SocraticButton>
        
        {/* Custom buttons */}
        {customButtons.map((button, index) => (
          <SocraticButton 
            key={index}
            onClick={button.onClick}
            type={button.type || "secondary"}
            disabled={button.disabled}
          >
            {button.label}
          </SocraticButton>
        ))}
      </div>
      
      <div className="chat-input">
        <input
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          placeholder="Type your message..."
          onKeyPress={(e) => e.key === 'Enter' && handleSend()}
        />
        <SocraticButton onClick={handleSend} type="primary">
          Send
        </SocraticButton>
      </div>
      
      <style jsx>{`
        /* Base styles - will be replaced by importing an actual CSS file in production */
        .sovereign-chat-window {
          display: flex;
          flex-direction: column;
          height: 500px;
          width: 100%;
          max-width: 800px;
          border: 1px solid #e0e0e0;
          border-radius: 8px;
          overflow: hidden;
          font-family: system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
        }
        
        .theme-light {
          background-color: #ffffff;
          color: #333333;
        }
        
        .theme-dark {
          background-color: #2a2a2a;
          color: #f0f0f0;
        }
        
        .chat-header {
          padding: 10px 16px;
          background-color: #f5f5f5;
          border-bottom: 1px solid #e0e0e0;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
        
        .theme-dark .chat-header {
          background-color: #333333;
          border-color: #444444;
        }
        
        .chat-messages {
          flex: 1;
          overflow-y: auto;
          padding: 16px;
          display: flex;
          flex-direction: column;
          gap: 12px;
        }
        
        .message-wrapper {
          display: flex;
          flex-direction: column;
          max-width: 80%;
        }
        
        .user-message {
          align-self: flex-end;
          background-color: #e1f5fe;
          border-radius: 18px 18px 0 18px;
        }
        
        .agent-message {
          align-self: flex-start;
          background-color: #f5f5f5;
          border-radius: 18px 18px 18px 0;
        }
        
        .theme-dark .user-message {
          background-color: #0d47a1;
          color: #ffffff;
        }
        
        .theme-dark .agent-message {
          background-color: #424242;
          color: #ffffff;
        }
        
        .chat-message {
          padding: 12px 16px;
          display: flex;
          align-items: flex-start;
          gap: 8px;
        }
        
        .message-avatar {
          font-size: 24px;
          min-width: 36px;
          height: 36px;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        
        .message-content {
          line-height: 1.4;
          white-space: pre-wrap;
        }
        
        .message-timestamp {
          font-size: 12px;
          color: #777777;
          align-self: flex-end;
          margin-top: 4px;
        }
        
        .typing-indicator {
          display: flex;
          padding: 12px 16px;
          background-color: #f5f5f5;
          border-radius: 18px;
          width: fit-content;
          align-self: flex-start;
        }
        
        .typing-indicator span {
          height: 8px;
          width: 8px;
          background-color: #606060;
          border-radius: 50%;
          display: inline-block;
          margin: 0 1px;
          animation: bounce 1.5s infinite ease-in-out;
        }
        
        .typing-indicator span:nth-child(1) {
          animation-delay: 0s;
        }
        
        .typing-indicator span:nth-child(2) {
          animation-delay: 0.2s;
        }
        
        .typing-indicator span:nth-child(3) {
          animation-delay: 0.4s;
        }
        
        @keyframes bounce {
          0%, 60%, 100% {
            transform: translateY(0);
          }
          30% {
            transform: translateY(-4px);
          }
        }
        
        .chat-actions {
          display: flex;
          gap: 8px;
          padding: 12px 16px;
          border-top: 1px solid #e0e0e0;
          flex-wrap: wrap;
        }
        
        .theme-dark .chat-actions {
          border-color: #444444;
        }
        
        .chat-input {
          display: flex;
          padding: 12px 16px;
          border-top: 1px solid #e0e0e0;
        }
        
        .theme-dark .chat-input {
          border-color: #444444;
        }
        
        .chat-input input {
          flex: 1;
          padding: 10px 12px;
          border: 1px solid #e0e0e0;
          border-radius: 4px;
          font-size: 14px;
          margin-right: 8px;
        }
        
        .theme-dark .chat-input input {
          background-color: #333333;
          border-color: #444444;
          color: #ffffff;
        }
        
        .virtue-alignment-container {
          padding: 12px 16px;
          border-top: 1px solid #e0e0e0;
        }
        
        .theme-dark .virtue-alignment-container {
          border-color: #444444;
        }
        
        .virtue-alignment {
          background-color: #f9f9f9;
          border-radius: 8px;
          padding: 12px;
        }
        
        .theme-dark .virtue-alignment {
          background-color: #333333;
        }
        
        .virtue-score {
          font-size: 18px;
          font-weight: bold;
          margin-bottom: 8px;
        }
        
        .virtue-summary {
          display: flex;
          justify-content: space-between;
          margin-bottom: 12px;
        }
        
        .primary-virtue {
          color: #4caf50;
          font-weight: bold;
        }
        
        .weakest-virtue {
          color: #ff9800;
          font-weight: bold;
        }
        
        .theme-dark .primary-virtue {
          color: #8bc34a;
        }
        
        .theme-dark .weakest-virtue {
          color: #ffc107;
        }
        
        .virtue-bars {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }
        
        .virtue-bar-container {
          display: flex;
          align-items: center;
        }
        
        .virtue-name {
          width: 100px;
          font-size: 14px;
          text-transform: capitalize;
        }
        
        .virtue-bar-wrapper {
          flex: 1;
          height: 12px;
          background-color: #e0e0e0;
          border-radius: 6px;
          overflow: hidden;
          position: relative;
        }
        
        .theme-dark .virtue-bar-wrapper {
          background-color: #444444;
        }
        
        .virtue-bar {
          height: 100%;
          background-color: #2196f3;
          border-radius: 6px;
          position: relative;
        }
        
        .virtue-bar::after {
          content: attr(data-value);
          position: absolute;
          right: 4px;
          top: -2px;
          font-size: 10px;
          color: white;
        }
        
        /* Button styles */
        .socratic-btn {
          padding: 8px 16px;
          border-radius: 4px;
          font-weight: 500;
          cursor: pointer;
          border: none;
          transition: all 0.2s ease;
        }
        
        .socratic-btn:hover {
          filter: brightness(1.1);
        }
        
        .socratic-btn:active {
          transform: scale(0.98);
        }
        
        .socratic-btn-primary {
          background-color: #2196f3;
          color: white;
        }
        
        .socratic-btn-secondary {
          background-color: #e0e0e0;
          color: #333333;
        }
        
        .theme-dark .socratic-btn-secondary {
          background-color: #424242;
          color: #f0f0f0;
        }
        
        .socratic-btn-tertiary {
          background-color: transparent;
          color: #2196f3;
          border: 1px solid #2196f3;
        }
        
        .socratic-btn-danger {
          background-color: #f44336;
          color: white;
        }
        
        .socratic-btn-disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }
        
        .socratic-btn-disabled:hover {
          filter: none;
        }
        
        .socratic-btn-disabled:active {
          transform: none;
        }
      `}</style>
    </div>
  );
}

/**
 * Example of creating a custom button component that integrates with Sovereign Agent
 */
export function VirtueEvaluationButton({ actionToEvaluate, onResult, children, ...props }) {
  const creed = useCreed();
  const [isLoading, setIsLoading] = useState(false);
  
  const handleClick = async () => {
    if (!actionToEvaluate || isLoading) return;
    
    setIsLoading(true);
    try {
      const result = await creed.evaluateDecision(actionToEvaluate);
      if (onResult) {
        onResult(result);
      }
    } catch (error) {
      console.error("Error evaluating action:", error);
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <SocraticButton 
      onClick={handleClick} 
      disabled={isLoading || !actionToEvaluate}
      {...props}
    >
      {isLoading ? "Evaluating..." : children || "Evaluate"}
    </SocraticButton>
  );
}

/**
 * Example usage of the components
 */
export function ExampleUsage() {
  const initialMessages = [
    { content: "Welcome! I'm here to help you with thoughtful, virtue-guided responses.", isUser: false, timestamp: new Date() }
  ];
  
  const [evaluationResult, setEvaluationResult] = useState(null);
  
  // Custom button example
  const customButtons = [
    {
      label: "Custom Action",
      onClick: () => alert("Custom action triggered!"),
      type: "tertiary"
    }
  ];
  
  return (
    <div style={{ maxWidth: '800px', margin: '0 auto' }}>
      <h1>Sovereign Agent Chat</h1>
      
      <CreedProvider reflectionFrequency={5} virtueThreshold={0.7}>
        <SovereignChatWindow 
          initialMessages={initialMessages}
          customButtons={customButtons}
          theme="light"
        />
        
        <div style={{ marginTop: '24px' }}>
          <h3>Custom Evaluation Button Example</h3>
          <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
            <VirtueEvaluationButton 
              actionToEvaluate="Rush to implement a solution without understanding the problem fully"
              onResult={setEvaluationResult}
              type="primary"
            >
              Evaluate This Action
            </VirtueEvaluationButton>
            
            {evaluationResult && (
              <div>
                Result: {evaluationResult.isAligned ? "Virtuous" : "Needs improvement"}
              </div>
            )}
          </div>
        </div>
      </CreedProvider>
    </div>
  );
}

export default {
  CreedProvider,
  useCreed,
  SocraticButton,
  VirtueAlignment,
  SovereignChatWindow,
  VirtueEvaluationButton,
  ExampleUsage
}; 