"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.NotionSchemaManager = void 0;
const axios_1 = __importDefault(require("axios"));
/**
 * Manages Notion database schema creation and updates
 */
class NotionSchemaManager {
    constructor() {
        this.baseUrl = 'http://localhost:8589';
    }
    /**
     * Set the base URL for the Notion API
     */
    setBaseUrl(url) {
        this.baseUrl = url;
    }
    /**
     * Get database schema from Notion
     */
    async getDatabaseSchema(databaseId) {
        try {
            const response = await axios_1.default.get(`${this.baseUrl}/api/database/${databaseId}`);
            if (response.data.success) {
                return response.data.database;
            }
            return null;
        }
        catch (error) {
            console.error('Failed to get database schema:', error);
            return null;
        }
    }
    /**
     * Create a new database in Notion with schema optimized for TodoItems
     */
    async createTodoDatabase(parentPageId, title) {
        try {
            const databaseProperties = this.createTodoDatabaseProperties();
            const response = await axios_1.default.post(`${this.baseUrl}/api/database`, {
                parent: { page_id: parentPageId },
                title: [{ type: 'text', text: { content: title } }],
                properties: databaseProperties
            });
            if (response.data.success) {
                return response.data.database_id;
            }
            return null;
        }
        catch (error) {
            console.error('Failed to create database:', error);
            return null;
        }
    }
    /**
     * Update an existing database schema to be compatible with TodoItems
     */
    async updateDatabaseSchema(databaseId) {
        try {
            const currentSchema = await this.getDatabaseSchema(databaseId);
            if (!currentSchema) {
                return false;
            }
            const requiredProperties = this.createTodoDatabaseProperties();
            const updates = {};
            // Check for missing or incorrect property types
            for (const [propName, propSchema] of Object.entries(requiredProperties)) {
                const existingProp = Object.entries(currentSchema.properties).find(([_, prop]) => prop.name === propName);
                if (!existingProp) {
                    // Property doesn't exist, add it
                    updates[propName] = propSchema;
                }
                else if (existingProp[1].type !== propSchema.type) {
                    // Property exists but has wrong type, update with warning
                    console.warn(`Cannot change property type for "${propName}" from "${existingProp[1].type}" to "${propSchema.type}"`);
                }
            }
            if (Object.keys(updates).length === 0) {
                // No updates needed
                return true;
            }
            // Apply updates
            const response = await axios_1.default.patch(`${this.baseUrl}/api/database/${databaseId}`, {
                properties: updates
            });
            return response.data.success;
        }
        catch (error) {
            console.error('Failed to update database schema:', error);
            return false;
        }
    }
    /**
     * Create the properties for a TodoItem-compatible database
     */
    createTodoDatabaseProperties() {
        return {
            'Title': {
                title: {}
            },
            'Status': {
                select: {
                    options: [
                        { name: 'Not Started', color: 'gray' },
                        { name: 'In Progress', color: 'blue' },
                        { name: 'Blocked', color: 'red' },
                        { name: 'Completed', color: 'green' },
                        { name: 'Recurring', color: 'purple' }
                    ]
                }
            },
            'Priority': {
                select: {
                    options: [
                        { name: 'P1 - Critical', color: 'red' },
                        { name: 'P2 - High', color: 'orange' },
                        { name: 'P3 - Medium', color: 'yellow' },
                        { name: 'P4 - Low', color: 'green' },
                        { name: 'P5 - Optional', color: 'blue' }
                    ]
                }
            },
            'Category': {
                select: {
                    options: [
                        { name: 'Uncategorized', color: 'gray' },
                        { name: 'Notion', color: 'blue' }
                    ]
                }
            },
            'Tags': {
                multi_select: {
                    options: [
                        { name: 'notion', color: 'blue' }
                    ]
                }
            },
            'Description': {
                rich_text: {}
            },
            'Created Date': {
                date: {}
            },
            'Last Updated': {
                date: {}
            }
        };
    }
    /**
     * Check if a database is compatible with TodoItems
     */
    async checkDatabaseCompatibility(databaseId) {
        try {
            const schema = await this.getDatabaseSchema(databaseId);
            if (!schema) {
                return { compatible: false, missingProperties: ['Database not found'] };
            }
            const requiredProperties = [
                { name: 'Title', type: 'title' },
                { name: 'Status', type: 'select' },
                { name: 'Priority', type: 'select' }
            ];
            const missingProperties = [];
            for (const reqProp of requiredProperties) {
                const hasProperty = Object.values(schema.properties).some(prop => prop.name === reqProp.name && prop.type === reqProp.type);
                if (!hasProperty) {
                    missingProperties.push(`${reqProp.name} (${reqProp.type})`);
                }
            }
            return {
                compatible: missingProperties.length === 0,
                missingProperties
            };
        }
        catch (error) {
            console.error('Failed to check database compatibility:', error);
            return {
                compatible: false,
                missingProperties: ['Error checking compatibility']
            };
        }
    }
}
exports.NotionSchemaManager = NotionSchemaManager;
//# sourceMappingURL=NotionSchemaManager.js.map