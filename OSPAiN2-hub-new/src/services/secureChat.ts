import axios from 'axios';

// Types
export interface Message {
  id: string;
  sender: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  encrypted: boolean;
}

export interface ChatRoom {
  id: string;
  name: string;
  createdAt: Date;
  lastActivity: Date;
  participants: string[];
  unreadCount: number;
}

export interface EncryptionKeys {
  publicKey: string;
  privateKey: string;
}

// API base URL - should be configured from environment
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

// Secure Chat API service
const SecureChatService = {
  // Get all chat rooms for the current user
  async getChatRooms(): Promise<ChatRoom[]> {
    try {
      // This is a placeholder - in a real app, this would call the backend
      // const response = await axios.get(`${API_URL}/secure-chat/rooms`);
      // return response.data;
      
      // Mock implementation
      return [
        {
          id: '1',
          name: 'Team Chat',
          createdAt: new Date(),
          lastActivity: new Date(),
          participants: ['user1', 'user2', 'user3'],
          unreadCount: 3
        },
        {
          id: '2',
          name: 'Project Alpha',
          createdAt: new Date(Date.now() - 86400000), // 1 day ago
          lastActivity: new Date(Date.now() - 3600000), // 1 hour ago
          participants: ['user1', 'user4'],
          unreadCount: 0
        }
      ];
    } catch (error) {
      console.error('Error fetching chat rooms:', error);
      throw error;
    }
  },

  // Get messages for a specific chat room
  async getMessages(roomId: string): Promise<Message[]> {
    try {
      // This is a placeholder - in a real app, this would call the backend
      // const response = await axios.get(`${API_URL}/secure-chat/rooms/${roomId}/messages`);
      // return response.data;
      
      // Mock implementation
      return [
        {
          id: '1',
          sender: 'assistant',
          content: 'Welcome to the secure chat!',
          timestamp: new Date(Date.now() - 3600000), // 1 hour ago
          encrypted: true
        },
        {
          id: '2',
          sender: 'user',
          content: 'Hello, is this connection secure?',
          timestamp: new Date(Date.now() - 1800000), // 30 minutes ago
          encrypted: true
        },
        {
          id: '3',
          sender: 'assistant',
          content: 'Yes, this connection is end-to-end encrypted.',
          timestamp: new Date(Date.now() - 1700000), // ~28 minutes ago
          encrypted: true
        }
      ];
    } catch (error) {
      console.error(`Error fetching messages for room ${roomId}:`, error);
      throw error;
    }
  },

  // Send a message to a chat room
  async sendMessage(roomId: string, content: string, encrypted: boolean): Promise<Message> {
    try {
      // This is a placeholder - in a real app, this would call the backend
      // const response = await axios.post(`${API_URL}/secure-chat/rooms/${roomId}/messages`, {
      //   content,
      //   encrypted
      // });
      // return response.data;
      
      // Mock implementation
      const newMessage: Message = {
        id: Date.now().toString(),
        sender: 'user',
        content,
        timestamp: new Date(),
        encrypted
      };
      
      return newMessage;
    } catch (error) {
      console.error(`Error sending message to room ${roomId}:`, error);
      throw error;
    }
  },

  // Generate new encryption keys
  async generateEncryptionKeys(): Promise<EncryptionKeys> {
    try {
      // This is a placeholder - in a real app, this would call the backend
      // const response = await axios.post(`${API_URL}/secure-chat/keys/generate`);
      // return response.data;
      
      // Mock implementation
      return {
        publicKey: 'mock-public-key-' + Math.random().toString(36).substring(2, 15),
        privateKey: 'mock-private-key-' + Math.random().toString(36).substring(2, 15)
      };
    } catch (error) {
      console.error('Error generating encryption keys:', error);
      throw error;
    }
  },

  // Verify secure connection
  async verifyConnection(): Promise<{isSecure: boolean, protocol: string}> {
    try {
      // This is a placeholder - in a real app, this would call the backend
      // const response = await axios.get(`${API_URL}/secure-chat/connection/verify`);
      // return response.data;
      
      // Mock implementation
      return {
        isSecure: true,
        protocol: 'TLS 1.3 + E2EE'
      };
    } catch (error) {
      console.error('Error verifying connection:', error);
      return {
        isSecure: false,
        protocol: 'Unknown'
      };
    }
  }
};

export default SecureChatService; 