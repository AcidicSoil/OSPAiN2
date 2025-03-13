export interface Note {
    id: string;
    title: string;
    content: string;
    tags: string[];
    category?: string;
    relatedTodos?: string[];
    createdAt: Date;
    updatedAt: Date;
    aiGenerated?: boolean;
    sourceUrl?: string;
    isDraft?: boolean;
}
export interface NoteList {
    items: Note[];
    lastUpdated: Date;
}
export interface NoteFilter {
    tags?: string[];
    category?: string;
    search?: string;
    hasTodoRelations?: boolean;
    isAiGenerated?: boolean;
    isDraft?: boolean;
}
export interface NoteStats {
    totalItems: number;
    byCategory: Record<string, number>;
    byTag: Record<string, number>;
    withTodoRelations: number;
    aiGenerated: number;
    drafts: number;
}
