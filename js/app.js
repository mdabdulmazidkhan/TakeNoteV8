/**
 * app.js
 * Main application entry point - coordinates all modules
 */

class TakenoteApp {
    constructor() {
        this.noteManager = new NoteManager();
        this.ui = new UI();
        this.editor = new Editor(this.ui.elements.textEditor);
        
        this.currentNoteId = null;
        this.autoSaveTimeout = null;
        
        this.initializeApp();
    }

    initializeApp() {
        this.bindEvents();
        this.loadInitialNote();
        this.updateUI();
    }

    bindEvents() {
        // UI event callbacks
        this.ui.onNewNote = () => this.createNewNote();
        this.ui.onNoteSelect = (noteId) => this.switchToNote(noteId);
        this.ui.onNoteDelete = (noteId, title) => this.deleteNote(noteId, title);
        this.ui.onNoteTitleEdit = (noteId, newTitle) => this.editNoteTitle(noteId, newTitle);
        
        // Toolbar event callbacks
        this.ui.onHeadingChange = (tag) => this.editor.setHeading(tag);
        this.ui.onBoldToggle = () => this.editor.toggleBold();
        this.ui.onItalicToggle = () => this.editor.toggleItalic();
        this.ui.onTextAlign = (alignment) => this.editor.setTextAlign(alignment);
        this.ui.onBulletList = () => this.editor.insertBulletList();
        this.ui.onNumberList = () => this.editor.insertNumberList();
        this.ui.onUndo = () => this.editor.undo();
        this.ui.onRedo = () => this.editor.redo();
        
        // File handling callbacks
        this.ui.onFileUpload = (file) => this.handleFileUpload(file);
        this.ui.onFileDownload = () => this.handleFileDownload();
        
        // Editor event callbacks
        this.editor.onContentChange = (content) => this.handleContentChange(content);
        this.editor.onToolbarStateChange = (state) => this.ui.updateToolbarState(state);
    }

    loadInitialNote() {
        const activeNote = this.noteManager.getActiveNote();
        if (activeNote) {
            this.currentNoteId = activeNote.id;
            this.editor.setContent(activeNote.content);
        } else {
            // Create a default note if none exists
            this.createNewNote();
        }
    }

    updateUI() {
        const notes = this.noteManager.getAllNotes();
        const activeNoteId = this.noteManager.activeNoteId;
        
        this.ui.renderNotesList(notes, activeNoteId);
        
        // Update status counters
        const content = this.editor.getContent();
        const stats = this.noteManager.getNoteStats(content);
        this.ui.updateStatusCounters(stats);
    }

    createNewNote() {
        const newNote = this.noteManager.createNote();
        this.currentNoteId = newNote.id;
        
        this.editor.setContent('<p><br></p>');
        this.updateUI();
        this.editor.focus();
        
        this.ui.showToast('New note created!', 'success');
    }

    switchToNote(noteId) {
        const note = this.noteManager.getNoteById(noteId);
        if (!note) return;
        
        // Save current note before switching
        if (this.currentNoteId && this.currentNoteId !== noteId) {
            this.saveCurrentNote();
        }
        
        this.noteManager.setActiveNote(noteId);
        this.currentNoteId = noteId;
        
        this.editor.setContent(note.content);
        this.updateUI();
        this.editor.focus();
    }

    deleteNote(noteId, title) {
        const wasDeleted = this.noteManager.deleteNote(noteId);
        
        if (wasDeleted) {
            // If we deleted the current note, switch to the new active note
            if (noteId === this.currentNoteId) {
                const newActiveNote = this.noteManager.getActiveNote();
                if (newActiveNote) {
                    this.currentNoteId = newActiveNote.id;
                    this.editor.setContent(newActiveNote.content);
                } else {
                    // No notes left, create a new one
                    this.createNewNote();
                    return;
                }
            }
            
            this.updateUI();
            this.ui.showToast('Note deleted successfully!', 'success');
        } else {
            this.ui.showErrorMessage('Failed to delete note.');
        }
    }

    editNoteTitle(noteId, newTitle) {
        const updatedNote = this.noteManager.updateNoteTitle(noteId, newTitle);
        if (updatedNote) {
            this.updateUI();
            this.ui.showToast('Note title updated!', 'success', 2000);
        } else {
            this.ui.showErrorMessage('Failed to update note title.');
        }
    }

    handleContentChange(content) {
        // Update live counters
        const stats = this.noteManager.getNoteStats(content);
        this.ui.updateStatusCounters(stats);
        
        // Auto-save with debouncing
        clearTimeout(this.autoSaveTimeout);
        this.autoSaveTimeout = setTimeout(() => {
            this.saveCurrentNote();
        }, 1000);
    }

    saveCurrentNote() {
        if (!this.currentNoteId) return;
        
        const content = this.editor.getContent();
        this.noteManager.updateNoteTitleFromContent(this.currentNoteId, content);
        
        // Update UI to reflect title changes
        this.updateUI();
    }

    handleFileUpload(file) {
        if (!file) return;
        
        // Check file type
        const allowedTypes = ['text/plain', 'text/markdown'];
        const allowedExtensions = ['.txt', '.md'];
        
        const hasValidType = allowedTypes.includes(file.type);
        const hasValidExtension = allowedExtensions.some(ext => 
            file.name.toLowerCase().endsWith(ext)
        );
        
        if (!hasValidType && !hasValidExtension) {
            this.ui.showErrorMessage('Please select a text file (.txt) or markdown file (.md).');
            return;
        }
        
        const reader = new FileReader();
        
        reader.onload = (e) => {
            try {
                const content = e.target.result;
                const newNote = this.noteManager.importTextContent(content, file.name);
                
                this.switchToNote(newNote.id);
                this.ui.showFileUploadFeedback(file.name);
            } catch (error) {
                console.error('File upload error:', error);
                this.ui.showErrorMessage('Failed to upload file. Please try again.');
            }
        };
        
        reader.onerror = () => {
            this.ui.showErrorMessage('Failed to read file. Please try again.');
        };
        
        reader.readAsText(file);
    }

    handleFileDownload() {
        if (!this.currentNoteId) {
            this.ui.showErrorMessage('No note to download.');
            return;
        }
        
        // Save current content first
        this.saveCurrentNote();
        
        const exportData = this.noteManager.exportNoteAsText(this.currentNoteId);
        if (!exportData) {
            this.ui.showErrorMessage('Failed to export note.');
            return;
        }
        
        try {
            const blob = new Blob([exportData.content], { type: 'text/plain;charset=utf-8' });
            const url = URL.createObjectURL(blob);
            
            const link = document.createElement('a');
            link.href = url;
            link.download = exportData.filename;
            link.style.display = 'none';
            
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            
            URL.revokeObjectURL(url);
            
            this.ui.showFileDownloadFeedback(exportData.filename);
        } catch (error) {
            console.error('Download error:', error);
            this.ui.showErrorMessage('Failed to download file. Please try again.');
        }
    }

    // Public methods for external access (if needed)
    getCurrentNote() {
        return this.noteManager.getActiveNote();
    }

    getAllNotes() {
        return this.noteManager.getAllNotes();
    }

    exportAllNotes() {
        const notes = this.noteManager.getAllNotes();
        const exportData = notes.map(note => ({
            title: note.title,
            content: note.content,
            createdAt: note.createdAt,
            updatedAt: note.updatedAt
        }));
        
        return JSON.stringify(exportData, null, 2);
    }
}

// Initialize the application when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.takenoteApp = new TakenoteApp();
    
    // Handle beforeunload to save current note
    window.addEventListener('beforeunload', () => {
        if (window.takenoteApp) {
            window.takenoteApp.saveCurrentNote();
        }
    });
    
    // Handle visibility change to save when tab becomes hidden
    document.addEventListener('visibilitychange', () => {
        if (document.hidden && window.takenoteApp) {
            window.takenoteApp.saveCurrentNote();
        }
    });
});