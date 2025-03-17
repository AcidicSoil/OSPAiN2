import '@testing-library/jest-dom';
import axios from 'axios';
import { NotionService } from '../NotionService';
import { TodoItem } from '../todo/todoStore';

// Mock axios
jest.mock('axios');
const mockedAxios = jest.mocked(axios);

// Mock localStorage
const mockLocalStorage = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
  length: 0,
  key: jest.fn(),
};
Object.defineProperty(window, 'localStorage', { value: mockLocalStorage });

describe('NotionService', () => {
  let notionService: NotionService;

  beforeEach(() => {
    jest.clearAllMocks();
    notionService = new NotionService();
  });

  describe('Connection Management', () => {
    it('should check connection successfully', async () => {
      mockedAxios.get.mockResolvedValueOnce({
        data: { success: true, status: 'connected' },
        status: 200,
        statusText: 'OK',
        headers: {},
        config: { url: `${notionService['baseUrl']}/api/status` },
      });

      const result = await notionService.checkConnection();
      expect(result).toBe(true);
      expect(mockedAxios.get).toHaveBeenCalledWith(`${notionService['baseUrl']}/api/status`);
    });

    it('should handle connection test failure', async () => {
      mockedAxios.get.mockRejectedValueOnce(new Error('Connection failed'));
      const result = await notionService.checkConnection();
      expect(result).toBe(false);
    });

    it('should return connection status', () => {
      expect(notionService.getConnectionStatus()).toBe(false);
    });
  });

  describe('Database Management', () => {
    it('should set and get database ID', () => {
      const databaseId = 'test-db';
      notionService.setDatabaseId(databaseId);
      expect(notionService.getDatabaseId()).toBe(databaseId);
    });

    it('should setup database successfully', async () => {
      const databaseId = 'test-db';
      mockedAxios.post.mockResolvedValueOnce({
        data: { success: true },
        status: 200,
        statusText: 'OK',
        headers: {},
        config: { url: `${notionService['baseUrl']}/api/database/setup` },
      });

      const result = await notionService.setupDatabase(databaseId);
      expect(result).toBe(true);
      expect(notionService.getDatabaseId()).toBe(databaseId);
    });
  });

  describe('Task Management', () => {
    const mockTodoItem: TodoItem = {
      id: 'test-id',
      title: 'Test Task',
      status: 'not-started',
      priority: 1,
      category: 'test',
      tags: ['test'],
      dateCreated: new Date(),
    };

    it('should create todo successfully', async () => {
      notionService.setDatabaseId('test-db');
      mockedAxios.post.mockResolvedValueOnce({
        data: { success: true, todo: mockTodoItem },
        status: 200,
        statusText: 'OK',
        headers: {},
        config: { url: `${notionService['baseUrl']}/api/tasks` },
      });

      const result = await notionService.createTodo(mockTodoItem);
      expect(result).toEqual(mockTodoItem);
    });

    it('should handle todo creation without database ID', async () => {
      await expect(notionService.createTodo(mockTodoItem)).rejects.toThrow('Database ID not set');
    });

    it('should sync tasks successfully', async () => {
      mockedAxios.post.mockResolvedValueOnce({
        data: { 
          success: true, 
          tasks: [mockTodoItem],
          errors: []
        },
        status: 200,
        statusText: 'OK',
        headers: {},
        config: { url: `${notionService['baseUrl']}/api/sync` },
      });

      const result = await notionService.syncTasks([mockTodoItem]);
      expect(result.success).toBe(true);
      expect(result.tasks).toHaveLength(1);
    });
  });

  describe('Search Functionality', () => {
    it('should search notes successfully', async () => {
      const mockResults = [{ id: 'test', title: 'Test Note' }];
      mockedAxios.post.mockResolvedValueOnce({
        data: { success: true, results: mockResults },
        status: 200,
        statusText: 'OK',
        headers: {},
        config: { url: `${notionService['baseUrl']}/api/search` },
      });

      const results = await notionService.searchNotes('test');
      expect(results).toEqual(mockResults);
      expect(mockedAxios.post).toHaveBeenCalledWith(
        `${notionService['baseUrl']}/api/search`,
        { query: 'test', limit: 10 }
      );
    });

    it('should handle search errors', async () => {
      mockedAxios.post.mockRejectedValueOnce(new Error('Search failed'));
      const results = await notionService.searchNotes('test');
      expect(results).toEqual([]);
    });
  });

  describe('Error Handling', () => {
    it('should handle network errors gracefully', async () => {
      mockedAxios.get.mockRejectedValueOnce(new Error('Network error'));
      await expect(notionService.checkConnection()).resolves.toBe(false);
    });

    it('should handle invalid response data', async () => {
      mockedAxios.post.mockResolvedValueOnce({
        data: null,
        status: 200,
        statusText: 'OK',
        headers: {},
        config: { url: `${notionService['baseUrl']}/api/search` },
      });

      const results = await notionService.searchNotes('test');
      expect(results).toEqual([]);
    });
  });
}); 