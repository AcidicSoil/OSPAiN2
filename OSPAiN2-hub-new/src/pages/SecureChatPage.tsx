import React, { useState, useEffect } from 'react';
import { LockClosedIcon, ShieldCheckIcon, ExclamationCircleIcon } from '@heroicons/react/24/solid';

interface Message {
  id: string;
  sender: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  encrypted: boolean;
}

// Simple encryption/decryption simulation
const encryptMessage = (message: string): string => {
  // This is just a simulation - not actual encryption
  return btoa(message);
};

const decryptMessage = (encryptedMessage: string): string => {
  // This is just a simulation - not actual decryption
  try {
    return atob(encryptedMessage);
  } catch (e) {
    return 'Unable to decrypt message';
  }
};

const SecureChatPage: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isEncrypted, setIsEncrypted] = useState(true);
  const [connectionStatus, setConnectionStatus] = useState<'secure' | 'insecure' | 'connecting'>('connecting');

  // Simulate connection establishment
  useEffect(() => {
    const timer = setTimeout(() => {
      setConnectionStatus('secure');
    }, 1500);
    
    return () => clearTimeout(timer);
  }, []);

  const handleSendMessage = () => {
    if (!inputValue.trim()) return;

    // Encrypt message if encryption is enabled
    const content = isEncrypted ? encryptMessage(inputValue) : inputValue;

    // Add user message
    const userMessage: Message = {
      id: Date.now().toString(),
      sender: 'user',
      content: content,
      timestamp: new Date(),
      encrypted: isEncrypted
    };

    setMessages([...messages, userMessage]);
    setInputValue('');

    // Simulate assistant response
    setTimeout(() => {
      const responseContent = isEncrypted 
        ? encryptMessage(`This is a secure response to: "${inputValue}"`)
        : `This is a response to: "${inputValue}"`;
        
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        sender: 'assistant',
        content: responseContent,
        timestamp: new Date(),
        encrypted: isEncrypted
      };
      
      setMessages(prev => [...prev, assistantMessage]);
    }, 1000);
  };

  const toggleEncryption = () => {
    setIsEncrypted(!isEncrypted);
  };

  const renderMessageContent = (message: Message) => {
    if (message.encrypted) {
      return (
        <div>
          <div className="flex items-center mb-1">
            <LockClosedIcon className="h-4 w-4 mr-1 text-green-500" />
            <span className="text-xs text-gray-500">Encrypted</span>
          </div>
          <p className="mb-1">{decryptMessage(message.content)}</p>
          <details className="text-xs text-gray-500">
            <summary>Show encrypted content</summary>
            <code className="font-mono text-xs block mt-1 p-1 bg-gray-100 rounded">{message.content}</code>
          </details>
        </div>
      );
    }
    return <p>{message.content}</p>;
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Secure Chat</h1>
        <div className="flex items-center">
          {connectionStatus === 'secure' ? (
            <div className="flex items-center text-green-600">
              <ShieldCheckIcon className="h-5 w-5 mr-1" />
              <span className="text-sm">Secure Connection</span>
            </div>
          ) : connectionStatus === 'insecure' ? (
            <div className="flex items-center text-red-600">
              <ExclamationCircleIcon className="h-5 w-5 mr-1" />
              <span className="text-sm">Insecure Connection</span>
            </div>
          ) : (
            <div className="flex items-center text-yellow-600">
              <div className="animate-pulse mr-1 h-5 w-5 rounded-full bg-yellow-500"></div>
              <span className="text-sm">Establishing secure connection...</span>
            </div>
          )}
        </div>
      </div>
      
      <div className="bg-white rounded-lg shadow-md p-4 mb-4 h-96 overflow-y-auto">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-gray-500">
            <LockClosedIcon className="h-8 w-8 mb-2 text-gray-400" />
            <p>Start a secure conversation</p>
            <p className="text-xs mt-2">End-to-end {isEncrypted ? 'encryption enabled' : 'encryption disabled'}</p>
          </div>
        ) : (
          <div className="space-y-4">
            {messages.map((message) => (
              <div 
                key={message.id}
                className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div 
                  className={`max-w-xs md:max-w-md lg:max-w-lg xl:max-w-xl rounded-lg px-4 py-2 ${
                    message.sender === 'user' 
                      ? 'bg-blue-500 text-white rounded-br-none' 
                      : 'bg-gray-200 text-gray-800 rounded-bl-none'
                  }`}
                >
                  {renderMessageContent(message)}
                  <span className="text-xs mt-1 opacity-75 block">
                    {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      
      <div className="bg-white rounded-lg shadow-md p-4">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center">
            <input
              type="checkbox"
              id="encryption-toggle"
              checked={isEncrypted}
              onChange={toggleEncryption}
              className="mr-2"
            />
            <label htmlFor="encryption-toggle" className="text-sm flex items-center">
              <LockClosedIcon className={`h-4 w-4 mr-1 ${isEncrypted ? 'text-green-500' : 'text-gray-400'}`} />
              End-to-end encryption
            </label>
          </div>
          <div className="text-xs text-gray-500">
            {connectionStatus === 'secure' ? 'AES-256 encryption' : 'Insecure'}
          </div>
        </div>
        
        <div className="flex">
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
            placeholder="Type a secure message..."
            className="flex-grow p-2 border border-gray-300 rounded-l-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            disabled={connectionStatus !== 'secure'}
          />
          <button
            onClick={handleSendMessage}
            disabled={connectionStatus !== 'secure'}
            className="bg-blue-500 text-white px-4 py-2 rounded-r-lg hover:bg-blue-600 transition disabled:bg-gray-400"
          >
            Send
          </button>
        </div>
      </div>
    </div>
  );
};

export default SecureChatPage; 