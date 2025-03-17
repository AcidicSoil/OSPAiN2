"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.NotionMapper = void 0;
/**
 * Maps between TodoItem and Notion formats
 */
class NotionMapper {
    constructor() {
        // Default property mappings
        this.propertyMappings = {
            title: 'Title',
            status: 'Status',
            priority: 'Priority',
            category: 'Category',
            tags: 'Tags',
            description: 'Description',
            dateCreated: 'Created Date',
            dateUpdated: 'Last Updated'
        };
    }
    /**
     * Set custom property mappings
     */
    setPropertyMappings(mappings) {
        this.propertyMappings = { ...this.propertyMappings, ...mappings };
    }
    /**
     * Convert TodoItem to Notion page properties
     */
    todoToNotionProperties(todo) {
        const properties = {
            [this.propertyMappings.title]: {
                title: [{ text: { content: todo.title } }]
            },
            [this.propertyMappings.status]: {
                select: { name: this.mapStatusToNotion(todo.status) }
            },
            [this.propertyMappings.priority]: {
                select: { name: this.mapPriorityToNotion(todo.priority) }
            },
            [this.propertyMappings.category]: {
                select: { name: todo.category }
            },
            [this.propertyMappings.tags]: {
                multi_select: todo.tags.map(tag => ({ name: tag }))
            }
        };
        // Add optional properties if they exist
        if (todo.description) {
            properties[this.propertyMappings.description] = {
                rich_text: [{ text: { content: todo.description } }]
            };
        }
        return properties;
    }
    /**
     * Convert Notion page to TodoItem
     */
    notionToTodo(page) {
        // Extract basic properties
        const title = this.extractTitle(page.properties[this.propertyMappings.title]);
        const status = this.mapStatusFromNotion(this.extractSelect(page.properties[this.propertyMappings.status]));
        const priority = this.mapPriorityFromNotion(this.extractSelect(page.properties[this.propertyMappings.priority]));
        const category = this.extractSelect(page.properties[this.propertyMappings.category]) || 'Uncategorized';
        const tags = this.extractMultiSelect(page.properties[this.propertyMappings.tags]);
        const description = this.extractRichText(page.properties[this.propertyMappings.description]);
        // Create TodoItem
        return {
            id: page.id,
            title,
            status: status,
            priority: priority,
            category,
            tags,
            dateCreated: new Date(page.created_time),
            dateUpdated: new Date(page.last_edited_time),
            description,
            subTasks: []
        };
    }
    /**
     * Convert NotionTask to TodoItem
     */
    notionTaskToTodo(task) {
        return {
            id: task.id,
            title: task.title,
            status: task.completed ? 'completed' : 'not-started',
            priority: 3, // Default medium priority
            category: 'Notion',
            tags: ['notion'],
            dateCreated: new Date(),
            description: task.description,
            subTasks: []
        };
    }
    /**
     * Convert TodoItem to NotionTask
     */
    todoToNotionTask(todo) {
        return {
            id: todo.id,
            title: todo.title,
            description: todo.description,
            completed: todo.status === 'completed',
            source: 'notion'
        };
    }
    // Helper methods for mapping status
    mapStatusToNotion(status) {
        const statusMap = {
            'not-started': 'Not Started',
            'in-progress': 'In Progress',
            'blocked': 'Blocked',
            'completed': 'Completed',
            'recurring': 'Recurring'
        };
        return statusMap[status];
    }
    mapStatusFromNotion(status) {
        if (!status)
            return 'not-started';
        const statusMap = {
            'Not Started': 'not-started',
            'In Progress': 'in-progress',
            'Blocked': 'blocked',
            'Completed': 'completed',
            'Recurring': 'recurring'
        };
        return statusMap[status] || 'not-started';
    }
    // Helper methods for mapping priority
    mapPriorityToNotion(priority) {
        const priorityMap = {
            1: 'P1 - Critical',
            2: 'P2 - High',
            3: 'P3 - Medium',
            4: 'P4 - Low',
            5: 'P5 - Optional'
        };
        return priorityMap[priority];
    }
    mapPriorityFromNotion(priority) {
        if (!priority)
            return 3; // Default to medium
        const priorityMap = {
            'P1 - Critical': 1,
            'P2 - High': 2,
            'P3 - Medium': 3,
            'P4 - Low': 4,
            'P5 - Optional': 5
        };
        return priorityMap[priority] || 3;
    }
    // Helper methods for extracting data from Notion properties
    extractTitle(property) {
        if (!property || property.type !== 'title' || !property.title.length) {
            return 'Untitled';
        }
        return property.title[0].text.content;
    }
    extractRichText(property) {
        if (!property || property.type !== 'rich_text' || !property.rich_text.length) {
            return undefined;
        }
        return property.rich_text.map((text) => text.text.content).join('');
    }
    extractSelect(property) {
        if (!property || property.type !== 'select' || !property.select) {
            return null;
        }
        return property.select.name;
    }
    extractMultiSelect(property) {
        if (!property || property.type !== 'multi_select') {
            return [];
        }
        return property.multi_select.map((select) => select.name);
    }
    extractDate(property) {
        if (!property || property.type !== 'date' || !property.date || !property.date.start) {
            return undefined;
        }
        return new Date(property.date.start);
    }
}
exports.NotionMapper = NotionMapper;
//# sourceMappingURL=NotionMapper.js.map