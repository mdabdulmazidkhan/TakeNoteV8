/**
 * ui.js
 * Handles all UI interactions and DOM manipulations
 */

class UI {
    constructor() {
        this.elements = this.initializeElements();
        this.bindUIEvents();
        
        // Callbacks (to be set by the main app)
        this.onNewNote = null;
        this.onNoteSelect = null;
        this.onNoteDelete = null;
        this.onNoteTitleEdit = null;
        this.onHeadingChange = null;
        this.onBoldToggle = null;
        this.onItalicToggle = null;
        this.onTextAlign = null;
        this.onBulletList = null;
        this.onNumberList = null;
        this.onUndo = null;
        this.onRedo = null;
        this.onFileUpload = null;
        this.onFileDownload = null;
    }

    initializeElements() {
        return {
            // Sidebar elements
            sidebarToggle: document.getElementById('sidebar-toggle'),
            sidebar: document.getElementById('sidebar'),
            sidebarOverlay: document.getElementById('sidebar-overlay'),
            newNoteBtn: document.getElementById('new-note-btn'),
            notesList: document.getElementById('notes-list'),
            
            // Toolbar elements
            headingSelect: document.getElementById('heading-select'),
            boldBtn: document.getElementById('bold-btn'),
            italicBtn: document.getElementById('italic-btn'),
            alignLeftBtn: document.getElementById('align-left-btn'),
            alignCenterBtn: document.getElementById('align-center-btn'),
            alignRightBtn: document.getElementById('align-right-btn'),
            bulletListBtn: document.getElementById('bullet-list-btn'),
            numberListBtn: document.getElementById('number-list-btn'),
            undoBtn: document.getElementById('undo-btn'),
            redoBtn: document.getElementById('redo-btn'),
            uploadBtn: document.getElementById('upload-btn'),
            uploadInput: document.getElementById('upload-input'),
            downloadBtn: document.getElementById('download-btn'),
            
            // Editor elements
            textEditor: document.getElementById('text-editor'),
            
            // Status elements
            wordCount: document.getElementById('word-count'),
            charCount: document.getElementById('char-count'),
            sentenceCount: document.getElementById('sentence-count'),
            
            // Delete modal elements
            deleteModal: document.getElementById('delete-modal'),
            deleteModalOverlay: document.querySelector('.delete-modal-overlay'),
            deleteModalNoteTitle: document.querySelector('.delete-modal-note-title'),
            deleteCancelBtn: document.getElementById('delete-cancel-btn'),
            deleteConfirmBtn: document.getElementById('delete-confirm-btn')
        };
    }

    bindUIEvents() {
        // Sidebar toggle for mobile
        if (this.elements.sidebarToggle) {
            this.elements.sidebarToggle.addEventListener('click', () => this.toggleSidebar());
        }
        
        if (this.elements.sidebarOverlay) {
            this.elements.sidebarOverlay.addEventListener('click', () => this.closeSidebar());
        }
        
        // New note button
        if (this.elements.newNoteBtn) {
            this.elements.newNoteBtn.addEventListener('click', () => {
                if (this.onNewNote) this.onNewNote();
            });
        }
        
        // Toolbar events
        if (this.elements.headingSelect) {
            this.elements.headingSelect.addEventListener('change', (e) => {
                if (this.onHeadingChange) this.onHeadingChange(e.target.value);
            });
        }
        
        if (this.elements.boldBtn) {
            this.elements.boldBtn.addEventListener('click', () => {
                if (this.onBoldToggle) this.onBoldToggle();
            });
        }
        
        if (this.elements.italicBtn) {
            this.elements.italicBtn.addEventListener('click', () => {
                if (this.onItalicToggle) this.onItalicToggle();
            });
        }
        
        // Text alignment buttons
        if (this.elements.alignLeftBtn) {
            this.elements.alignLeftBtn.addEventListener('click', () => {
                if (this.onTextAlign) this.onTextAlign('left');
            });
        }
        
        if (this.elements.alignCenterBtn) {
            this.elements.alignCenterBtn.addEventListener('click', () => {
                if (this.onTextAlign) this.onTextAlign('center');
            });
        }
        
        if (this.elements.alignRightBtn) {
            this.elements.alignRightBtn.addEventListener('click', () => {
                if (this.onTextAlign) this.onTextAlign('right');
            });
        }
        
        // List buttons
        if (this.elements.bulletListBtn) {
            this.elements.bulletListBtn.addEventListener('click', () => {
                if (this.onBulletList) this.onBulletList();
            });
        }
        
        if (this.elements.numberListBtn) {
            this.elements.numberListBtn.addEventListener('click', () => {
                if (this.onNumberList) this.onNumberList();
            });
        }
        
        // Undo/Redo buttons
        if (this.elements.undoBtn) {
            this.elements.undoBtn.addEventListener('click', () => {
                if (this.onUndo) this.onUndo();
            });
        }
        
        if (this.elements.redoBtn) {
            this.elements.redoBtn.addEventListener('click', () => {
                if (this.onRedo) this.onRedo();
            });
        }
        
        // File handling
        if (this.elements.uploadBtn) {
            this.elements.uploadBtn.addEventListener('click', () => {
                if (this.elements.uploadInput) {
                    this.elements.uploadInput.click();
                }
            });
        }
        
        if (this.elements.uploadInput) {
            this.elements.uploadInput.addEventListener('change', (e) => {
                const file = e.target.files[0];
                if (file && this.onFileUpload) {
                    this.onFileUpload(file);
                }
                e.target.value = ''; // Reset input
            });
        }
        
        if (this.elements.downloadBtn) {
            this.elements.downloadBtn.addEventListener('click', () => {
                if (this.onFileDownload) this.onFileDownload();
            });
        }
        
        // Delete modal events
        if (this.elements.deleteCancelBtn) {
            this.elements.deleteCancelBtn.addEventListener('click', () => {
                this.hideDeleteModal();
            });
        }
        
        if (this.elements.deleteModalOverlay) {
            this.elements.deleteModalOverlay.addEventListener('click', () => {
                this.hideDeleteModal();
            });
        }
        
        // Handle Escape key to close modal
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.elements.deleteModal && !this.elements.deleteModal.classList.contains('hidden')) {
                this.hideDeleteModal();
            }
        });
    }

    // Render notes list in sidebar
    renderNotesList(notes, activeNoteId) {
        if (!this.elements.notesList) return;
        
        this.elements.notesList.innerHTML = '';
        
        notes.forEach(note => {
            const listItem = document.createElement('li');
            listItem.className = 'note-item';
            if (note.id === activeNoteId) {
                listItem.classList.add('active');
            }
            
            listItem.innerHTML = `
                <span class="note-title" contenteditable="false">${this.escapeHtml(note.title)}</span>
                <button class="note-delete-btn" title="Delete note">
                    <i class="fas fa-trash"></i>
                </button>
            `;
            
            // Note selection event
            const titleSpan = listItem.querySelector('.note-title');
            titleSpan.addEventListener('click', (e) => {
                // Only select if not editing
                if (!titleSpan.classList.contains('editing')) {
                    if (this.onNoteSelect) this.onNoteSelect(note.id);
                }
            });
            
            // Double-click to edit title
            titleSpan.addEventListener('dblclick', (e) => {
                e.stopPropagation();
                this.startTitleEdit(titleSpan, note.id, note.title);
            });
            
            // Single click when editing should focus
            titleSpan.addEventListener('click', (e) => {
                if (titleSpan.classList.contains('editing')) {
                    e.stopPropagation();
                    titleSpan.focus();
                }
            });
            
            // Note deletion event
            const deleteBtn = listItem.querySelector('.note-delete-btn');
            deleteBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                this.showDeleteModal(note.id, note.title);
            });
            
            this.elements.notesList.appendChild(listItem);
        });
    }

    // Update toolbar button states
    updateToolbarState(state) {
        if (this.elements.boldBtn) {
            this.elements.boldBtn.classList.toggle('active', state.bold);
        }
        if (this.elements.italicBtn) {
            this.elements.italicBtn.classList.toggle('active', state.italic);
        }
    }

    // Update status counters
    updateStatusCounters(stats) {
        if (this.elements.wordCount) {
            this.elements.wordCount.textContent = `Words: ${stats.words}`;
        }
        if (this.elements.charCount) {
            this.elements.charCount.textContent = `Characters: ${stats.characters}`;
        }
        if (this.elements.sentenceCount) {
            this.elements.sentenceCount.textContent = `Sentences: ${stats.sentences}`;
        }
    }

    // Mobile sidebar controls
    toggleSidebar() {
        if (this.elements.sidebar && this.elements.sidebarOverlay) {
            this.elements.sidebar.classList.toggle('active');
            this.elements.sidebarOverlay.classList.toggle('active');
        }
    }

    closeSidebar() {
        if (this.elements.sidebar && this.elements.sidebarOverlay) {
            this.elements.sidebar.classList.remove('active');
            this.elements.sidebarOverlay.classList.remove('active');
        }
    }

    // Toast notifications
    showToast(message, type = 'info', duration = 3000) {
        const toast = document.createElement('div');
        toast.className = `toast toast-${type}`;
        toast.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: ${type === 'success' ? '#27AE60' : type === 'error' ? '#E74C3C' : '#3498DB'};
            color: white;
            padding: 12px 20px;
            border-radius: 4px;
            z-index: 10000;
            font-size: 14px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
            transform: translateX(100%);
            transition: transform 0.3s ease;
        `;
        toast.textContent = message;
        
        document.body.appendChild(toast);
        
        // Animate in
        setTimeout(() => {
            toast.style.transform = 'translateX(0)';
        }, 100);
        
        // Remove after duration
        setTimeout(() => {
            toast.style.transform = 'translateX(100%)';
            setTimeout(() => {
                if (document.body.contains(toast)) {
                    document.body.removeChild(toast);
                }
            }, 300);
        }, duration);
    }

    // Error message display
    showErrorMessage(message) {
        this.showToast(message, 'error');
    }

    // File feedback messages
    showFileUploadFeedback(filename) {
        this.showToast(`File "${filename}" uploaded successfully!`, 'success');
    }

    showFileDownloadFeedback(filename) {
        this.showToast(`File "${filename}" downloaded successfully!`, 'success');
    }

    // Custom Delete Confirmation Modal
    showDeleteModal(noteId, noteTitle) {
        if (!this.elements.deleteModal) return;
        
        // Store the note info for when user confirms
        this.pendingDelete = { noteId, noteTitle };
        
        // Update modal content
        if (this.elements.deleteModalNoteTitle) {
            this.elements.deleteModalNoteTitle.textContent = `"${noteTitle}"`;
        }
        
        // Show modal
        this.elements.deleteModal.classList.remove('hidden');
        
        // Focus on cancel button for better UX
        if (this.elements.deleteCancelBtn) {
            setTimeout(() => this.elements.deleteCancelBtn.focus(), 100);
        }
        
        // Set up confirm button handler
        if (this.elements.deleteConfirmBtn) {
            // Remove existing listener to prevent duplicates
            const newConfirmBtn = this.elements.deleteConfirmBtn.cloneNode(true);
            this.elements.deleteConfirmBtn.parentNode.replaceChild(newConfirmBtn, this.elements.deleteConfirmBtn);
            this.elements.deleteConfirmBtn = newConfirmBtn;
            
            this.elements.deleteConfirmBtn.addEventListener('click', () => {
                this.confirmDelete();
            });
        }
    }
    
    hideDeleteModal() {
        if (!this.elements.deleteModal) return;
        
        this.elements.deleteModal.classList.add('hidden');
        this.pendingDelete = null;
    }
    
    confirmDelete() {
        if (this.pendingDelete && this.onNoteDelete) {
            this.onNoteDelete(this.pendingDelete.noteId, this.pendingDelete.noteTitle);
        }
        this.hideDeleteModal();
    }

    // Title Editing Functionality
    startTitleEdit(titleElement, noteId, currentTitle) {
        // Prevent multiple edits
        if (titleElement.classList.contains('editing')) {
            return;
        }
        
        // Store original title for cancel
        titleElement.setAttribute('data-original-title', currentTitle);
        titleElement.setAttribute('data-note-id', noteId);
        
        // Enable editing
        titleElement.contentEditable = true;
        titleElement.classList.add('editing');
        
        // Select all text
        const range = document.createRange();
        range.selectNodeContents(titleElement);
        const selection = window.getSelection();
        selection.removeAllRanges();
        selection.addRange(range);
        
        // Focus the element
        titleElement.focus();
        
        // Add event listeners for save/cancel
        const keydownHandler = (e) => {
            e.stopPropagation();
            if (e.key === 'Enter') {
                e.preventDefault();
                this.saveTitleEdit(titleElement);
            } else if (e.key === 'Escape') {
                e.preventDefault();
                this.cancelTitleEdit(titleElement);
            }
        };
        
        const blurHandler = (e) => {
            // Small delay to allow other clicks to be processed
            setTimeout(() => {
                if (titleElement.classList.contains('editing')) {
                    this.saveTitleEdit(titleElement);
                }
            }, 100);
        };
        
        titleElement.addEventListener('keydown', keydownHandler);
        titleElement.addEventListener('blur', blurHandler);
        
        // Store handlers for cleanup
        titleElement._keydownHandler = keydownHandler;
        titleElement._blurHandler = blurHandler;
    }
    
    saveTitleEdit(titleElement) {
        const noteId = titleElement.getAttribute('data-note-id');
        const newTitle = titleElement.textContent.trim();
        
        if (newTitle && this.onNoteTitleEdit) {
            this.onNoteTitleEdit(noteId, newTitle);
        }
        
        this.endTitleEdit(titleElement);
    }
    
    cancelTitleEdit(titleElement) {
        const originalTitle = titleElement.getAttribute('data-original-title');
        titleElement.textContent = originalTitle;
        this.endTitleEdit(titleElement);
    }
    
    endTitleEdit(titleElement) {
        // Cleanup
        titleElement.contentEditable = false;
        titleElement.classList.remove('editing');
        titleElement.removeAttribute('data-original-title');
        titleElement.removeAttribute('data-note-id');
        
        // Remove event listeners
        if (titleElement._keydownHandler) {
            titleElement.removeEventListener('keydown', titleElement._keydownHandler);
            delete titleElement._keydownHandler;
        }
        if (titleElement._blurHandler) {
            titleElement.removeEventListener('blur', titleElement._blurHandler);
            delete titleElement._blurHandler;
        }
        
        // Clear selection
        window.getSelection().removeAllRanges();
    }

    // Utility function to escape HTML
    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
}