export interface Note {
  id: string;
  title: string;
  content: string;
  tags: string[];
  category?: string;
  relatedTodos?: string[]; // IDs of related todo items
  createdAt: Date;
  updatedAt: Date;
  aiGenerated?: boolean;
  sourceUrl?: string; // For notes captured from web
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
