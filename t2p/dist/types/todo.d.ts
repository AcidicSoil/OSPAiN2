export interface TodoItem {
    id: string;
    title: string;
    description?: string;
    priority: 1 | 2 | 3 | 4 | 5;
    status: 'not-started' | 'in-progress' | 'blocked' | 'completed' | 'recurring';
    tags: string[];
    category?: string;
    createdAt: Date;
    updatedAt: Date;
    horizon?: 'H1' | 'H2' | 'H3';
    githubIssue?: {
        number: number;
        url: string;
    };
    createdBy?: string;
    assignedTo?: string[];
    approvalStatus?: 'pending' | 'approved' | 'rejected';
    approvalBy?: string;
    approvalDate?: Date;
    approvalNotes?: string;
    commands?: string[];
}
export interface TodoList {
    items: TodoItem[];
    lastUpdated: Date;
}
export interface TodoFilter {
    priority?: number;
    status?: string;
    tags?: string[];
    category?: string;
    horizon?: string;
    search?: string;
    approvalStatus?: string;
    assignedTo?: string;
}
export interface TodoStats {
    totalItems: number;
    byPriority: Record<number, number>;
    byStatus: Record<string, number>;
    byHorizon: Record<string, number>;
    byCategory: Record<string, number>;
}
