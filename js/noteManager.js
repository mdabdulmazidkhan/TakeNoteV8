/**
 * noteManager.js
 * Handles all note-related operations and state management
 */

class NoteManager {
    constructor() {
        this.notes = [];
        this.activeNoteId = null;
        this.loadNotesFromStorage();
    }

    // Generate unique ID for notes
    generateId() {
        return 'note_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    }

    // Create a new note
    createNote(title = 'Untitled Note', content = '') {
        const note = {
            id: this.generateId(),
            title: title,
            content: content,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };
        
        this.notes.unshift(note); // Add to beginning
        this.activeNoteId = note.id;
        this.saveNotesToStorage();
        return note;
    }

    // Get a note by ID
    getNoteById(id) {
        return this.notes.find(note => note.id === id);
    }

    // Get the active note
    getActiveNote() {
        if (!this.activeNoteId) {
            return null;
        }
        return this.getNoteById(this.activeNoteId);
    }

    // Update note content
    updateNote(id, updates) {
        const noteIndex = this.notes.findIndex(note => note.id === id);
        if (noteIndex !== -1) {
            this.notes[noteIndex] = {
                ...this.notes[noteIndex],
                ...updates,
                updatedAt: new Date().toISOString()
            };
            this.saveNotesToStorage();
            return this.notes[noteIndex];
        }
        return null;
    }

    // Update note title only
    updateNoteTitle(id, newTitle) {
        const noteIndex = this.notes.findIndex(note => note.id === id);
        if (noteIndex !== -1) {
            this.notes[noteIndex] = {
                ...this.notes[noteIndex],
                title: newTitle.trim() || 'Untitled Note',
                updatedAt: new Date().toISOString()
            };
            this.saveNotesToStorage();
            return this.notes[noteIndex];
        }
        return null;
    }

    // Update note title based on content
    updateNoteTitleFromContent(id, content) {
        const firstLine = this.extractFirstLineAsTitle(content);
        if (firstLine) {
            this.updateNote(id, { 
                title: firstLine.substring(0, 50) + (firstLine.length > 50 ? '...' : ''),
                content: content
            });
        } else {
            this.updateNote(id, { content: content });
        }
    }

    // Extract first line as title
    extractFirstLineAsTitle(content) {
        if (!content || typeof content !== 'string') return '';
        
        // Remove HTML tags and get plain text
        const plainText = content.replace(/<[^>]*>/g, '').trim();
        if (!plainText) return '';
        
        // Get first meaningful line
        const firstLine = plainText.split('\n')[0].trim();
        return firstLine || 'Untitled Note';
    }

    // Delete a note
    deleteNote(id) {
        const noteIndex = this.notes.findIndex(note => note.id === id);
        if (noteIndex !== -1) {
            this.notes.splice(noteIndex, 1);
            
            // If the deleted note was active, set a new active note
            if (this.activeNoteId === id) {
                if (this.notes.length > 0) {
                    this.activeNoteId = this.notes[0].id;
                } else {
                    this.activeNoteId = null;
                }
            }
            
            this.saveNotesToStorage();
            return true;
        }
        return false;
    }

    // Set active note
    setActiveNote(id) {
        const note = this.getNoteById(id);
        if (note) {
            this.activeNoteId = id;
            return note;
        }
        return null;
    }

    // Get all notes
    getAllNotes() {
        return this.notes;
    }

    // Save notes to localStorage
    saveNotesToStorage() {
        try {
            localStorage.setItem('takenote-notes', JSON.stringify(this.notes));
            localStorage.setItem('takenote-active-id', this.activeNoteId || '');
        } catch (error) {
            console.warn('Failed to save notes to localStorage:', error);
        }
    }

    // Load notes from localStorage
    loadNotesFromStorage() {
        try {
            const savedNotes = localStorage.getItem('takenote-notes');
            const savedActiveId = localStorage.getItem('takenote-active-id');
            
            if (savedNotes) {
                this.notes = JSON.parse(savedNotes);
            }
            
            if (savedActiveId && this.getNoteById(savedActiveId)) {
                this.activeNoteId = savedActiveId;
            } else if (this.notes.length > 0) {
                this.activeNoteId = this.notes[0].id;
            }

            // If no notes exist, create a default one
            if (this.notes.length === 0) {
                this.createNote('Welcome to takenote', '<p>Welcome to takenote! This is your first note.</p><p>You can:</p><ul><li>Format text with the toolbar</li><li>Create new notes</li><li>Upload and download files</li><li>And much more!</li></ul>');
            }
        } catch (error) {
            console.warn('Failed to load notes from localStorage:', error);
            // Create default note on error
            this.createNote('Welcome to takenote', '<p>Welcome to takenote! Start taking notes.</p>');
        }
    }

    // Export note as text
    exportNoteAsText(id) {
        const note = this.getNoteById(id);
        if (!note) return null;
        
        // Convert HTML to plain text
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = note.content;
        const plainText = tempDiv.textContent || tempDiv.innerText || '';
        
        return {
            title: note.title,
            content: plainText,
            filename: this.sanitizeFilename(note.title) + '.txt'
        };
    }

    // Sanitize filename
    sanitizeFilename(filename) {
        return filename.replace(/[^a-z0-9]/gi, '_').toLowerCase();
    }

    // Import text content
    importTextContent(content, filename = '') {
        const title = filename ? filename.replace(/\.[^/.]+$/, '') : 'Imported Note';
        
        // Convert plain text to HTML paragraphs
        const htmlContent = content
            .split('\n')
            .map(line => line.trim())
            .filter(line => line.length > 0)
            .map(line => `<p>${this.escapeHtml(line)}</p>`)
            .join('');
        
        return this.createNote(title, htmlContent || '<p></p>');
    }

    // Escape HTML
    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    // Get note statistics
    getNoteStats(content) {
        if (!content) {
            return { words: 0, characters: 0, sentences: 0 };
        }
        
        // Convert HTML to plain text
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = content;
        const plainText = tempDiv.textContent || tempDiv.innerText || '';
        
        const characters = plainText.length;
        const words = plainText.trim() ? plainText.trim().split(/\s+/).length : 0;
        const sentences = plainText.trim() ? plainText.split(/[.!?]+/).filter(s => s.trim().length > 0).length : 0;
        
        return { words, characters, sentences };
    }
}