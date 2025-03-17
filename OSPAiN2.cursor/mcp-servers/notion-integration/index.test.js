const request = require('supertest');
const express = require('express');
const { Client } = require('@notionhq/client');
const path = require('path');

// Mock environment variables
process.env.NOTION_API_KEY = 'test-api-key';
process.env.NOTION_DATABASE_ID = 'test-database-id';
process.env.PORT = '8589';

// Mock Notion client
jest.mock('@notionhq/client');

// Mock dotenv
jest.mock('dotenv', () => ({
  config: jest.fn()
}));

// Import the app after mocking
const app = require('./index');

describe('Notion Integration Server', () => {
  let mockNotion;
  
  beforeEach(() => {
    // Reset all mocks
    jest.clearAllMocks();
    
    // Setup mock implementations
    mockNotion = {
      databases: {
        query: jest.fn().mockResolvedValue({ results: [] }),
        retrieve: jest.fn().mockResolvedValue({
          properties: {
            'Name': { type: 'title' },
            'Status': { type: 'select' },
            'Priority': { type: 'number' },
            'Tags': { type: 'multi_select' },
            'Description': { type: 'rich_text' },
            'Due Date': { type: 'date' },
            'Category': { type: 'select' }
          }
        })
      },
      pages: {
        create: jest.fn().mockResolvedValue({ id: 'new-page-id' }),
        update: jest.fn().mockResolvedValue({ id: 'updated-page-id' }),
        retrieve: jest.fn().mockResolvedValue({
          id: 'test-page-id',
          properties: {
            'Name': { 
              type: 'title',
              title: [{ plain_text: 'Test Task' }]
            },
            'Status': {
              type: 'select',
              select: { name: 'In Progress' }
            }
          },
          last_edited_time: new Date().toISOString(),
          url: 'https://notion.so/test-page'
        })
      },
      blocks: {
        children: {
          list: jest.fn().mockResolvedValue({ results: [] }),
          append: jest.fn().mockResolvedValue({})
        },
        delete: jest.fn().mockResolvedValue({})
      }
    };
    
    // Set the mock implementation
    Client.mockImplementation(() => mockNotion);
  });

  describe('SSE Endpoint', () => {
    test('should return capabilities', async () => {
      const res = await request(app)
        .get('/sse')
        .set('Accept', 'text/event-stream');
      
      expect(res.status).toBe(200);
      expect(res.headers['content-type']).toBe('text/event-stream');
      expect(res.text).toContain('notion-integration');
      expect(res.text).toContain('searchNotes');
      expect(res.text).toContain('getNote');
      expect(res.text).toContain('createNote');
      expect(res.text).toContain('updateNote');
    });
  });

  describe('Note API Endpoints', () => {
    test('should search notes', async () => {
      mockNotion.databases.query.mockResolvedValueOnce({
        results: [{ id: 'note-1' }, { id: 'note-2' }]
      });
      
      const res = await request(app)
        .post('/api/search')
        .send({ query: 'test', limit: 5 });
      
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.results).toHaveLength(2);
      expect(mockNotion.databases.query).toHaveBeenCalledWith(expect.objectContaining({
        database_id: 'test-database-id',
        page_size: 5
      }));
    });
    
    test('should get a note by ID', async () => {
      mockNotion.pages.retrieve.mockResolvedValueOnce({ id: 'test-note-id' });
      mockNotion.blocks.children.list.mockResolvedValueOnce({
        results: [{ type: 'paragraph', paragraph: { text: 'Test content' } }]
      });
      
      const res = await request(app)
        .get('/api/note/test-note-id');
      
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.page).toEqual({ id: 'test-note-id' });
      expect(mockNotion.pages.retrieve).toHaveBeenCalledWith({
        page_id: 'test-note-id'
      });
    });
    
    test('should create a new note', async () => {
      const res = await request(app)
        .post('/api/note')
        .send({
          title: 'New Test Note',
          content: 'This is a test note',
          tags: ['test', 'note']
        });
      
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(mockNotion.pages.create).toHaveBeenCalledWith(expect.objectContaining({
        parent: { database_id: 'test-database-id' },
        properties: expect.objectContaining({
          title: expect.any(Object),
          tags: expect.any(Object)
        })
      }));
    });
    
    test('should update an existing note', async () => {
      const res = await request(app)
        .patch('/api/note/test-note-id')
        .send({
          title: 'Updated Note',
          tags: ['updated']
        });
      
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(mockNotion.pages.update).toHaveBeenCalledWith(expect.objectContaining({
        page_id: 'test-note-id',
        properties: expect.objectContaining({
          title: expect.any(Object)
        })
      }));
    });
    
    test('should handle errors when searching notes', async () => {
      mockNotion.databases.query.mockRejectedValueOnce(new Error('API error'));
      
      const res = await request(app)
        .post('/api/search')
        .send({ query: 'test' });
      
      expect(res.status).toBe(500);
      expect(res.body.success).toBe(false);
      expect(res.body.error).toBe('API error');
    });
  });

  describe('Command Handler', () => {
    test('should handle searchNotes command', async () => {
      mockNotion.databases.query.mockResolvedValueOnce({
        results: [{ id: 'note-1' }]
      });
      
      const res = await request(app)
        .post('/command')
        .send({
          command: 'searchNotes',
          parameters: { query: 'test', limit: 5 }
        });
      
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.result).toEqual([{ id: 'note-1' }]);
    });
    
    test('should handle getNote command', async () => {
      mockNotion.pages.retrieve.mockResolvedValueOnce({ id: 'test-note-id' });
      mockNotion.blocks.children.list.mockResolvedValueOnce({
        results: [{ type: 'paragraph' }]
      });
      
      const res = await request(app)
        .post('/command')
        .send({
          command: 'getNote',
          parameters: { id: 'test-note-id' }
        });
      
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.result).toEqual({
        page: { id: 'test-note-id' },
        blocks: [{ type: 'paragraph' }]
      });
    });
    
    test('should handle createNote command', async () => {
      const res = await request(app)
        .post('/command')
        .send({
          command: 'createNote',
          parameters: {
            title: 'New Note',
            content: 'Content',
            tags: ['tag1']
          }
        });
      
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(mockNotion.pages.create).toHaveBeenCalled();
    });
    
    test('should handle updateNote command', async () => {
      const res = await request(app)
        .post('/command')
        .send({
          command: 'updateNote',
          parameters: {
            id: 'test-note-id',
            title: 'Updated Title'
          }
        });
      
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(mockNotion.pages.update).toHaveBeenCalled();
    });
    
    test('should handle unknown commands', async () => {
      const res = await request(app)
        .post('/command')
        .send({
          command: 'unknownCommand',
          parameters: {}
        });
      
      expect(res.status).toBe(500);
      expect(res.body.success).toBe(false);
      expect(res.body.error).toContain('Unknown command');
    });
  });

  describe('Task Management Endpoints', () => {
    test('should fetch all tasks', async () => {
      mockNotion.databases.query.mockResolvedValueOnce({
        results: [
          {
            id: 'task-1',
            properties: {
              'Name': { 
                type: 'title',
                title: [{ plain_text: 'Task 1' }]
              }
            },
            last_edited_time: new Date().toISOString(),
            url: 'https://notion.so/task-1'
          }
        ]
      });
      
      const res = await request(app)
        .get('/api/tasks');
      
      expect(res.status).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
      expect(res.body[0].id).toBe('task-1');
      expect(res.body[0].title).toBe('Task 1');
    });
    
    test('should fetch a single task by ID', async () => {
      mockNotion.pages.retrieve.mockResolvedValueOnce({
        id: 'test-task-id',
        properties: {
          'Name': { 
            type: 'title',
            title: [{ plain_text: 'Complex Task' }]
          },
          'Status': {
            type: 'select',
            select: { name: 'In Progress' }
          },
          'Priority': {
            type: 'number',
            number: 2
          },
          'Tags': {
            type: 'multi_select',
            multi_select: [{ name: 'test' }]
          },
          'Description': {
            type: 'rich_text',
            rich_text: [{ plain_text: 'Test description' }]
          }
        },
        last_edited_time: new Date().toISOString(),
        url: 'https://notion.so/test-task'
      });
      
      const res = await request(app)
        .get('/api/tasks/test-task-id');
      
      expect(res.status).toBe(200);
      expect(res.body.id).toBe('test-task-id');
      expect(res.body.title).toBe('Complex Task');
      expect(res.body.status).toBe('In Progress');
      expect(res.body.priority).toBe(2);
    });
    
    test('should create a new task', async () => {
      const res = await request(app)
        .post('/api/tasks')
        .send({
          task: {
            title: 'New Task',
            priority: 1,
            tags: ['important']
          }
        });
      
      expect(res.status).toBe(200);
      expect(res.body.title).toBe('Test Task');
      expect(mockNotion.pages.create).toHaveBeenCalled();
    });
    
    test('should update an existing task', async () => {
      const res = await request(app)
        .put('/api/tasks/test-task-id')
        .send({
          updates: {
            title: 'Updated Task',
            status: 'completed'
          }
        });
      
      expect(res.status).toBe(200);
      expect(mockNotion.pages.update).toHaveBeenCalled();
    });
    
    test('should delete (archive) a task', async () => {
      const res = await request(app)
        .delete('/api/tasks/test-task-id');
      
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(mockNotion.pages.update).toHaveBeenCalledWith({
        page_id: 'test-task-id',
        archived: true
      });
    });
    
    test('should sync tasks', async () => {
      mockNotion.databases.query.mockResolvedValueOnce({
        results: [
          {
            id: 'notion-task-1',
            properties: {
              'Name': { 
                type: 'title',
                title: [{ plain_text: 'Existing Task' }]
              }
            },
            last_edited_time: new Date().toISOString(),
            url: 'https://notion.so/task-1'
          }
        ]
      });
      
      const res = await request(app)
        .post('/api/sync')
        .send({
          tasks: [
            { id: 'notion-task-1', title: 'Updated Task' },
            { title: 'New Task' }
          ]
        });
      
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.syncedCount).toBe(2);
    });
    
    test('should handle missing task title when creating', async () => {
      const res = await request(app)
        .post('/api/tasks')
        .send({
          task: { priority: 1 }
        });
      
      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.error).toContain('Task title is required');
    });
  });

  describe('Helper Functions', () => {
    test('should format Notion task correctly', async () => {
      // This test indirectly tests the formatNotionTask function
      mockNotion.pages.retrieve.mockResolvedValueOnce({
        id: 'test-task-id',
        properties: {
          'Name': { 
            type: 'title',
            title: [{ plain_text: 'Complex Task' }]
          },
          'Status': {
            type: 'select',
            select: { name: 'In Progress' }
          },
          'Priority': {
            type: 'number',
            number: 2
          },
          'Tags': {
            type: 'multi_select',
            multi_select: [{ name: 'test' }]
          },
          'Description': {
            type: 'rich_text',
            rich_text: [{ plain_text: 'Test description' }]
          }
        },
        last_edited_time: new Date().toISOString(),
        url: 'https://notion.so/test-task'
      });
      
      const res = await request(app)
        .get('/api/tasks/test-task-id');
      
      expect(res.status).toBe(200);
      expect(res.body.id).toBe('test-task-id');
      expect(res.body.title).toBe('Complex Task');
      expect(res.body.status).toBe('In Progress');
      expect(res.body.priority).toBe(2);
    });
  });
});
