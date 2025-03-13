import { Note, NoteFilter, NoteStats } from '../types/note';
import { LLMMiddlewareService } from './llm-middleware.service';
/**
 * Service for managing notes
 *
 * Features:
 * - Create, update, delete, and search notes
 * - Link notes to todos
 * - AI-assisted note generation and summarization
 * - Export/import functionality
 * - Markdown support
 */
export declare class NoteService {
    private notesFile;
    private notes;
    private llmService;
    /**
     * Creates a new note service instance
     *
     * @param notesFile Path to the notes file (defaults to master-notes.md)
     * @param llmService Optional LLM service for AI features
     */
    constructor(notesFile?: string, llmService?: LLMMiddlewareService);
    /**
     * Loads notes from the notes file
     */
    private loadNotes;
    /**
     * Saves notes to the notes file
     */
    private saveNotes;
    /**
     * Creates a new note
     *
     * @param title Note title
     * @param content Note content
     * @param tags Optional tags
     * @param category Optional category
     * @param relatedTodos Optional related todo IDs
     * @param isDraft Whether this is a draft note
     * @returns The created note
     */
    createNote(title: string, content: string, tags?: string[], category?: string, relatedTodos?: string[], isDraft?: boolean): Note;
    /**
     * Updates an existing note
     *
     * @param id Note ID
     * @param updates Fields to update
     * @returns The updated note or null if not found
     */
    updateNote(id: string, updates: Partial<Omit<Note, 'id' | 'createdAt'>>): Note | null;
    /**
     * Deletes a note by ID
     *
     * @param id Note ID
     * @returns True if deleted, false if not found
     */
    deleteNote(id: string): boolean;
    /**
     * Gets a note by ID
     *
     * @param id Note ID
     * @returns The note or null if not found
     */
    getNote(id: string): Note | null;
    /**
     * Gets all notes, optionally filtered
     *
     * @param filter Optional filter criteria
     * @returns Filtered notes
     */
    getNotes(filter?: NoteFilter): Note[];
    /**
     * Gets statistics about the notes
     *
     * @returns Statistics object
     */
    getStats(): NoteStats;
    /**
     * Links a note to one or more todos
     *
     * @param noteId Note ID
     * @param todoIds Todo IDs to link
     * @returns Updated note or null if not found
     */
    linkToTodos(noteId: string, todoIds: string[]): Note | null;
    /**
     * Unlinks a note from one or more todos
     *
     * @param noteId Note ID
     * @param todoIds Todo IDs to unlink
     * @returns Updated note or null if not found
     */
    unlinkFromTodos(noteId: string, todoIds: string[]): Note | null;
    /**
     * Uses AI to generate a new note from a prompt
     *
     * @param prompt Prompt for the note content
     * @param title Optional title (will be generated if not provided)
     * @returns Generated note or null if generation failed
     */
    generateNoteWithAI(prompt: string, title?: string): Promise<Note | null>;
    /**
     * Uses AI to summarize a note
     *
     * @param noteId Note ID to summarize
     * @param length 'short', 'medium', or 'long' summary
     * @returns Summarized content or null if failed
     */
    summarizeNote(noteId: string, length?: 'short' | 'medium' | 'long'): Promise<string | null>;
    /**
     * Creates a note from a web article
     *
     * @param url URL of the article
     * @returns Created note or null if failed
     */
    createNoteFromWebPage(url: string): Promise<Note | null>;
    /**
     * Uses AI to generate a note from a URL
     *
     * @param url URL to generate note from
     * @returns Generated note or null if failed
     */
    private generateNoteFromUrl;
    /**
     * Exports notes to a different format
     *
     * @param format Export format ('md', 'json', 'html')
     * @param outputPath Output file path
     * @param filter Optional filter for notes to export
     * @returns Path to the exported file or null if failed
     */
    exportNotes(format: 'md' | 'json' | 'html', outputPath: string, filter?: NoteFilter): string | null;
    /**
     * Generates markdown export content
     *
     * @param notes Notes to export
     * @returns Markdown content
     */
    private generateMarkdownExport;
    /**
     * Generates JSON export content
     *
     * @param notes Notes to export
     * @returns JSON content
     */
    private generateJsonExport;
    /**
     * Generates HTML export content
     *
     * @param notes Notes to export
     * @returns HTML content
     */
    private generateHtmlExport;
    /**
     * Converts basic markdown to HTML
     *
     * @param markdown Markdown content
     * @returns HTML content
     */
    private markdownToHtml;
    /**
     * Escapes HTML special characters
     *
     * @param text Text to escape
     * @returns Escaped text
     */
    private escapeHtml;
}
