import * as fs from 'fs';
import * as path from 'path';
import { v4 as uuidv4 } from 'uuid';
import { Note, NoteList, NoteFilter, NoteStats } from '../types/note';
import { TerminalExecutor } from '../utils/terminal-executor';
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
export class NoteService {
  private notesFile: string;
  private notes: NoteList;
  private llmService: LLMMiddlewareService;

  /**
   * Creates a new note service instance
   *
   * @param notesFile Path to the notes file (defaults to master-notes.md)
   * @param llmService Optional LLM service for AI features
   */
  constructor(
    notesFile: string = path.join(process.cwd(), 'master-notes.md'),
    llmService?: LLMMiddlewareService
  ) {
    this.notesFile = notesFile;
    this.llmService = llmService || new LLMMiddlewareService();
    this.notes = this.loadNotes();
  }

  /**
   * Loads notes from the notes file
   */
  private loadNotes(): NoteList {
    try {
      if (!fs.existsSync(this.notesFile)) {
        // Create default notes file if it doesn't exist
        fs.writeFileSync(
          this.notesFile,
          '# Notes\n\nThis file contains notes managed by the t2p CLI tool.\n\n<!-- T2P_NOTES_DATA\n{"items":[],"lastUpdated":"' +
            new Date().toISOString() +
            '"}\n-->'
        );
        return { items: [], lastUpdated: new Date() };
      }

      const content = fs.readFileSync(this.notesFile, 'utf-8');
      // Extract JSON data from the file between <!-- T2P_NOTES_DATA ... --> markers
      const match = content.match(/<!-- T2P_NOTES_DATA\n([\s\S]*?)\n-->/);

      if (match && match[1]) {
        const data = JSON.parse(match[1]) as NoteList;
        // Convert date strings to Date objects
        data.lastUpdated = new Date(data.lastUpdated);
        data.items.forEach((note) => {
          note.createdAt = new Date(note.createdAt);
          note.updatedAt = new Date(note.updatedAt);
        });
        return data;
      }

      // If no data found, return empty list
      return { items: [], lastUpdated: new Date() };
    } catch (error) {
      console.error('Error loading notes:', error);
      return { items: [], lastUpdated: new Date() };
    }
  }

  /**
   * Saves notes to the notes file
   */
  private saveNotes(): void {
    try {
      // Update lastUpdated timestamp
      this.notes.lastUpdated = new Date();

      // Create file content with visible markdown and embedded JSON data
      const notesJson = JSON.stringify(this.notes, null, 2);

      // Generate markdown content for human readability
      let markdownContent = '# Notes\n\n';
      markdownContent += `Last updated: ${this.notes.lastUpdated.toLocaleString()}\n\n`;

      // Add each note as a markdown section
      this.notes.items.forEach((note) => {
        markdownContent += `## ${note.title}\n\n`;
        markdownContent += `${note.content}\n\n`;
        if (note.tags && note.tags.length > 0) {
          markdownContent += `Tags: ${note.tags.join(', ')}\n\n`;
        }
        markdownContent += `---\n\n`;
      });

      // Add the JSON data at the end, hidden in HTML comments
      markdownContent += `<!-- T2P_NOTES_DATA\n${notesJson}\n-->`;

      fs.writeFileSync(this.notesFile, markdownContent);
    } catch (error) {
      console.error('Error saving notes:', error);
      throw new Error(`Failed to save notes: ${error}`);
    }
  }

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
  createNote(
    title: string,
    content: string,
    tags: string[] = [],
    category?: string,
    relatedTodos?: string[],
    isDraft: boolean = false
  ): Note {
    const now = new Date();
    const note: Note = {
      id: uuidv4(),
      title,
      content,
      tags,
      category,
      relatedTodos,
      createdAt: now,
      updatedAt: now,
      isDraft,
    };

    this.notes.items.push(note);
    this.saveNotes();

    return note;
  }

  /**
   * Updates an existing note
   *
   * @param id Note ID
   * @param updates Fields to update
   * @returns The updated note or null if not found
   */
  updateNote(id: string, updates: Partial<Omit<Note, 'id' | 'createdAt'>>): Note | null {
    const noteIndex = this.notes.items.findIndex((note) => note.id === id);
    if (noteIndex === -1) return null;

    const note = this.notes.items[noteIndex];

    // Apply updates
    Object.assign(note, { ...updates, updatedAt: new Date() });

    this.saveNotes();
    return note;
  }

  /**
   * Deletes a note by ID
   *
   * @param id Note ID
   * @returns True if deleted, false if not found
   */
  deleteNote(id: string): boolean {
    const initialLength = this.notes.items.length;
    this.notes.items = this.notes.items.filter((note) => note.id !== id);

    if (this.notes.items.length < initialLength) {
      this.saveNotes();
      return true;
    }

    return false;
  }

  /**
   * Gets a note by ID
   *
   * @param id Note ID
   * @returns The note or null if not found
   */
  getNote(id: string): Note | null {
    return this.notes.items.find((note) => note.id === id) || null;
  }

  /**
   * Gets all notes, optionally filtered
   *
   * @param filter Optional filter criteria
   * @returns Filtered notes
   */
  getNotes(filter?: NoteFilter): Note[] {
    if (!filter) return [...this.notes.items];

    return this.notes.items.filter((note) => {
      // Apply each filter condition
      if (filter.tags && filter.tags.length > 0) {
        if (!note.tags.some((tag) => filter.tags!.includes(tag))) return false;
      }

      if (filter.category && note.category !== filter.category) return false;

      if (filter.search) {
        const searchLower = filter.search.toLowerCase();
        const titleMatch = note.title.toLowerCase().includes(searchLower);
        const contentMatch = note.content.toLowerCase().includes(searchLower);
        if (!titleMatch && !contentMatch) return false;
      }

      if (filter.hasTodoRelations !== undefined) {
        const hasTodos = !!note.relatedTodos && note.relatedTodos.length > 0;
        if (hasTodos !== filter.hasTodoRelations) return false;
      }

      if (filter.isAiGenerated !== undefined && note.aiGenerated !== filter.isAiGenerated) {
        return false;
      }

      if (filter.isDraft !== undefined && note.isDraft !== filter.isDraft) {
        return false;
      }

      return true;
    });
  }

  /**
   * Gets statistics about the notes
   *
   * @returns Statistics object
   */
  getStats(): NoteStats {
    const stats: NoteStats = {
      totalItems: this.notes.items.length,
      byCategory: {},
      byTag: {},
      withTodoRelations: 0,
      aiGenerated: 0,
      drafts: 0,
    };

    this.notes.items.forEach((note) => {
      // Count by category
      if (note.category) {
        stats.byCategory[note.category] = (stats.byCategory[note.category] || 0) + 1;
      }

      // Count by tag
      note.tags.forEach((tag) => {
        stats.byTag[tag] = (stats.byTag[tag] || 0) + 1;
      });

      // Count notes with todo relations
      if (note.relatedTodos && note.relatedTodos.length > 0) {
        stats.withTodoRelations++;
      }

      // Count AI-generated notes
      if (note.aiGenerated) {
        stats.aiGenerated++;
      }

      // Count drafts
      if (note.isDraft) {
        stats.drafts++;
      }
    });

    return stats;
  }

  /**
   * Links a note to one or more todos
   *
   * @param noteId Note ID
   * @param todoIds Todo IDs to link
   * @returns Updated note or null if not found
   */
  linkToTodos(noteId: string, todoIds: string[]): Note | null {
    const note = this.getNote(noteId);
    if (!note) return null;

    const currentRelations = note.relatedTodos || [];
    const newRelations = [...new Set([...currentRelations, ...todoIds])];

    return this.updateNote(noteId, { relatedTodos: newRelations });
  }

  /**
   * Unlinks a note from one or more todos
   *
   * @param noteId Note ID
   * @param todoIds Todo IDs to unlink
   * @returns Updated note or null if not found
   */
  unlinkFromTodos(noteId: string, todoIds: string[]): Note | null {
    const note = this.getNote(noteId);
    if (!note || !note.relatedTodos) return null;

    const newRelations = note.relatedTodos.filter((id) => !todoIds.includes(id));

    return this.updateNote(noteId, { relatedTodos: newRelations });
  }

  /**
   * Uses AI to generate a new note from a prompt
   *
   * @param prompt Prompt for the note content
   * @param title Optional title (will be generated if not provided)
   * @returns Generated note or null if generation failed
   */
  async generateNoteWithAI(prompt: string, title?: string): Promise<Note | null> {
    try {
      // Initialize the LLM service if needed
      await this.llmService.init();

      // Build a prompt for the LLM
      const aiPrompt = `
        Generate a detailed note based on the following prompt:
        
        "${prompt}"
        
        The note should include:
        1. A clear title (if not already provided)
        2. Well-structured content with markdown formatting
        3. 2-5 relevant tags
        4. A suitable category
        
        Format the response as a JSON object with these fields:
        - title: The note title
        - content: The markdown content
        - tags: Array of relevant tags
        - category: A suitable category
      `;

      // Call the LLM
      const llmResponse = await this.llmService.callLLM(aiPrompt);

      // Extract JSON from the response
      const jsonMatch =
        llmResponse.match(/```json\n([\s\S]*?)\n```/) || llmResponse.match(/{[\s\S]*?}/);

      if (!jsonMatch) {
        console.error('Failed to parse LLM response');
        return null;
      }

      const noteData = JSON.parse(jsonMatch[1] || jsonMatch[0]);

      // Create the note
      return this.createNote(
        title || noteData.title,
        noteData.content,
        noteData.tags,
        noteData.category,
        undefined,
        false // Not a draft
      );
    } catch (error) {
      console.error('Error generating note with AI:', error);
      return null;
    }
  }

  /**
   * Uses AI to summarize a note
   *
   * @param noteId Note ID to summarize
   * @param length 'short', 'medium', or 'long' summary
   * @returns Summarized content or null if failed
   */
  async summarizeNote(
    noteId: string,
    length: 'short' | 'medium' | 'long' = 'medium'
  ): Promise<string | null> {
    const note = this.getNote(noteId);
    if (!note) return null;

    try {
      // Initialize the LLM service if needed
      await this.llmService.init();

      // Determine target length
      let wordCount: number;
      switch (length) {
        case 'short':
          wordCount = 50;
          break;
        case 'medium':
          wordCount = 100;
          break;
        case 'long':
          wordCount = 200;
          break;
      }

      // Build a prompt for the LLM
      const aiPrompt = `
        Summarize the following note in approximately ${wordCount} words:
        
        Title: ${note.title}
        
        ${note.content}
        
        Provide a concise summary that captures the key points.
      `;

      // Call the LLM
      const summary = await this.llmService.callLLM(aiPrompt);

      return summary.trim();
    } catch (error) {
      console.error('Error summarizing note with AI:', error);
      return null;
    }
  }

  /**
   * Creates a note from a web article
   *
   * @param url URL of the article
   * @returns Created note or null if failed
   */
  async createNoteFromWebPage(url: string): Promise<Note | null> {
    try {
      // Use a simple command to fetch the webpage content
      // In a real implementation, you might want to use a proper library for this
      const command = `curl -s "${url}" | grep -E '<title>|<meta name="description"|<h1>' | sed 's/<[^>]*>//g' | sed 's/^[ \t]*//'`;
      const result = TerminalExecutor.execute(command);

      // Extract title and description from the result
      const lines = result.split('\n').filter((line) => line.trim());

      // If we couldn't extract anything, use AI to generate from the URL
      if (lines.length === 0) {
        return this.generateNoteFromUrl(url);
      }

      // Use the first line as title if available
      const title = lines[0] || 'Note from web';

      // Use remaining lines as initial content
      let content = lines.slice(1).join('\n\n') || '';
      content += `\n\nSource: ${url}`;

      // Create the note
      const note = this.createNote(
        title,
        content,
        ['web-capture'],
        'research',
        undefined,
        true // Mark as draft so user can review
      );

      // Save the source URL
      this.updateNote(note.id, { sourceUrl: url });

      return note;
    } catch (error) {
      console.error('Error creating note from web page:', error);
      return this.generateNoteFromUrl(url);
    }
  }

  /**
   * Uses AI to generate a note from a URL
   *
   * @param url URL to generate note from
   * @returns Generated note or null if failed
   */
  private async generateNoteFromUrl(url: string): Promise<Note | null> {
    try {
      // Use a more complex approach with AI
      const prompt = `Generate a detailed note about the webpage at: ${url}`;
      const note = await this.generateNoteWithAI(prompt);

      if (note) {
        // Add web-capture tag and save source URL
        const updatedTags = [...note.tags, 'web-capture'];
        this.updateNote(note.id, {
          tags: updatedTags,
          sourceUrl: url,
          aiGenerated: true,
        });

        return this.getNote(note.id);
      }

      return null;
    } catch (error) {
      console.error('Error generating note from URL:', error);
      return null;
    }
  }

  /**
   * Exports notes to a different format
   *
   * @param format Export format ('md', 'json', 'html')
   * @param outputPath Output file path
   * @param filter Optional filter for notes to export
   * @returns Path to the exported file or null if failed
   */
  exportNotes(
    format: 'md' | 'json' | 'html',
    outputPath: string,
    filter?: NoteFilter
  ): string | null {
    try {
      // Get notes to export (filtered if needed)
      const notesToExport = this.getNotes(filter);

      let content = '';

      switch (format) {
        case 'md':
          content = this.generateMarkdownExport(notesToExport);
          break;
        case 'json':
          content = this.generateJsonExport(notesToExport);
          break;
        case 'html':
          content = this.generateHtmlExport(notesToExport);
          break;
      }

      fs.writeFileSync(outputPath, content);
      return outputPath;
    } catch (error) {
      console.error(`Error exporting notes to ${format}:`, error);
      return null;
    }
  }

  /**
   * Generates markdown export content
   *
   * @param notes Notes to export
   * @returns Markdown content
   */
  private generateMarkdownExport(notes: Note[]): string {
    let content = '# Exported Notes\n\n';
    content += `Exported on: ${new Date().toLocaleString()}\n\n`;

    notes.forEach((note) => {
      content += `## ${note.title}\n\n`;
      content += `${note.content}\n\n`;

      if (note.tags.length > 0) {
        content += `**Tags**: ${note.tags.join(', ')}\n\n`;
      }

      if (note.category) {
        content += `**Category**: ${note.category}\n\n`;
      }

      content += `*Created: ${note.createdAt.toLocaleString()}*\n`;
      content += `*Updated: ${note.updatedAt.toLocaleString()}*\n\n`;
      content += `---\n\n`;
    });

    return content;
  }

  /**
   * Generates JSON export content
   *
   * @param notes Notes to export
   * @returns JSON content
   */
  private generateJsonExport(notes: Note[]): string {
    return JSON.stringify(
      {
        exported: new Date().toISOString(),
        notes,
      },
      null,
      2
    );
  }

  /**
   * Generates HTML export content
   *
   * @param notes Notes to export
   * @returns HTML content
   */
  private generateHtmlExport(notes: Note[]): string {
    let content = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Exported Notes</title>
        <style>
          body {
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Oxygen-Sans, Ubuntu, Cantarell, "Helvetica Neue", sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 800px;
            margin: 0 auto;
            padding: 20px;
          }
          h1 {
            border-bottom: 2px solid #eaecef;
            padding-bottom: 10px;
          }
          h2 {
            margin-top: 30px;
            border-bottom: 1px solid #eaecef;
            padding-bottom: 5px;
          }
          .tags, .category, .meta {
            font-size: 0.9em;
            color: #666;
          }
          .note {
            margin-bottom: 40px;
            padding-bottom: 20px;
            border-bottom: 1px solid #eee;
          }
          .content {
            white-space: pre-wrap;
          }
        </style>
      </head>
      <body>
        <h1>Exported Notes</h1>
        <p>Exported on: ${new Date().toLocaleString()}</p>
    `;

    notes.forEach((note) => {
      content += `
        <div class="note">
          <h2>${this.escapeHtml(note.title)}</h2>
          <div class="content">${this.markdownToHtml(note.content)}</div>
          
          ${
            note.tags.length > 0
              ? `<p class="tags"><strong>Tags:</strong> ${note.tags.map((tag) => this.escapeHtml(tag)).join(', ')}</p>`
              : ''
          }
          
          ${
            note.category
              ? `<p class="category"><strong>Category:</strong> ${this.escapeHtml(note.category)}</p>`
              : ''
          }
          
          <p class="meta">
            Created: ${note.createdAt.toLocaleString()}<br>
            Updated: ${note.updatedAt.toLocaleString()}
          </p>
        </div>
      `;
    });

    content += `
      </body>
      </html>
    `;

    return content;
  }

  /**
   * Converts basic markdown to HTML
   *
   * @param markdown Markdown content
   * @returns HTML content
   */
  private markdownToHtml(markdown: string): string {
    if (!markdown) return '';

    // Very basic markdown conversion
    let html = this.escapeHtml(markdown);

    // Convert headers
    html = html.replace(/^### (.*?)$/gm, '<h3>$1</h3>');
    html = html.replace(/^## (.*?)$/gm, '<h2>$1</h2>');
    html = html.replace(/^# (.*?)$/gm, '<h1>$1</h1>');

    // Convert bold and italic
    html = html.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
    html = html.replace(/\*(.*?)\*/g, '<em>$1</em>');

    // Convert links
    html = html.replace(/\[(.*?)\]\((.*?)\)/g, '<a href="$2">$1</a>');

    // Convert lists
    html = html.replace(/^- (.*?)$/gm, '<li>$1</li>');
    html = html.replace(/(<li>.*?<\/li>\n)+/g, '<ul>$&</ul>');
    html = html.replace(/^(\d+)\. (.*?)$/gm, '<li>$2</li>');
    html = html.replace(/(<li>.*?<\/li>\n)+/g, '<ol>$&</ol>');

    // Convert paragraphs
    html = html.replace(/\n\n/g, '</p><p>');
    html = '<p>' + html + '</p>';

    // Fix any double paragraph tags
    html = html.replace(/<p><\/p>/g, '');

    return html;
  }

  /**
   * Escapes HTML special characters
   *
   * @param text Text to escape
   * @returns Escaped text
   */
  private escapeHtml(text: string): string {
    return text
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }
}
