/**
 * SECOND BRAIN // Workspace Controller & Application Logic
 * Zerotsudios UI Neobrutalist Markdown Workspace
 */

let currentNoteId = null;
let saveTimeout = null;
let allNotes = [];

document.addEventListener('DOMContentLoaded', async () => {
  try {
    // 1. Initialize DB
    await window.SecondBrainDB.init();

    // 2. Setup Marked renderer options
    if (window.marked) {
      marked.setOptions({
        gfm: true,
        breaks: true
      });
    }

    // 3. Setup DOM references
    bindEventListeners();

    // 4. Load notes
    await refreshNotesList();

    // 5. Select first note
    if (allNotes.length > 0) {
      selectNote(allNotes[0].id);
    }
  } catch (err) {
    console.error('Initialization error:', err);
    Zerotsudios.toast('FAILED TO INITIALIZE DATABASE', 'danger');
  }
});

function bindEventListeners() {
  const newNoteBtn = document.getElementById('btn-new-note');
  const searchInput = document.getElementById('search-input');
  const titleInput = document.getElementById('note-title-input');
  const contentTextarea = document.getElementById('note-content-textarea');
  const pinBtn = document.getElementById('btn-pin-note');
  const deleteBtn = document.getElementById('btn-delete-note');
  const exportMdBtn = document.getElementById('btn-export-md');
  const exportVaultBtn = document.getElementById('btn-export-vault');
  const togglePreviewBtn = document.getElementById('btn-toggle-preview');
  const importVaultInput = document.getElementById('import-vault-input');

  if (newNoteBtn) {
    newNoteBtn.addEventListener('click', handleCreateNewNote);
  }

  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      renderNotesList(e.target.value.trim().toLowerCase());
    });
  }

  if (titleInput) {
    titleInput.addEventListener('input', handleEditorInput);
  }

  if (contentTextarea) {
    contentTextarea.addEventListener('input', handleEditorInput);
  }

  if (pinBtn) {
    pinBtn.addEventListener('click', handleTogglePin);
  }

  if (deleteBtn) {
    deleteBtn.addEventListener('click', handleDeleteNote);
  }

  if (exportMdBtn) {
    exportMdBtn.addEventListener('click', handleExportNoteMd);
  }

  if (exportVaultBtn) {
    exportVaultBtn.addEventListener('click', handleExportVault);
  }

  if (importVaultInput) {
    importVaultInput.addEventListener('change', handleImportVault);
  }

  if (togglePreviewBtn) {
    togglePreviewBtn.addEventListener('click', () => {
      const previewPanel = document.getElementById('preview-panel');
      if (previewPanel) {
        previewPanel.classList.toggle('hidden');
        Zerotsudios.toast(
          previewPanel.classList.contains('hidden') ? 'PREVIEW HIDDEN' : 'PREVIEW ACTIVE',
          'info'
        );
      }
    });
  }
}

async function refreshNotesList() {
  allNotes = await window.SecondBrainDB.getAllNotes();
  const searchInput = document.getElementById('search-input');
  const query = searchInput ? searchInput.value.trim().toLowerCase() : '';
  renderNotesList(query);
}

function renderNotesList(query = '') {
  const listContainer = document.getElementById('notes-list');
  const countBadge = document.getElementById('notes-count-badge');
  if (!listContainer) return;

  listContainer.innerHTML = '';

  const filtered = allNotes.filter(note => {
    if (!query) return true;
    const titleMatch = (note.title || '').toLowerCase().includes(query);
    const contentMatch = (note.content || '').toLowerCase().includes(query);
    const tagsMatch = (note.tags || []).some(t => t.toLowerCase().includes(query));
    return titleMatch || contentMatch || tagsMatch;
  });

  if (countBadge) {
    countBadge.textContent = `${filtered.length} NOTES`;
  }

  if (filtered.length === 0) {
    listContainer.innerHTML = `
      <div class="p-4 text-center border-2 border-dashed border-[#0A090D] bg-[#F4F1FA] text-xs font-mono text-[#0A090D]">
        NO RECORDS MATCH QUERY
      </div>
    `;
    return;
  }

  filtered.forEach(note => {
    const item = document.createElement('div');
    const isActive = note.id === currentNoteId;
    item.className = `note-item p-3 border-2 border-[#0A090D] shadow-[2px_2px_0_#0A090D] mb-3 ${isActive ? 'active' : 'bg-white'}`;
    
    const dateFormatted = new Date(note.updatedAt || Date.now()).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });

    const previewSnippet = (note.content || '').replace(/[#*`>\-_]/g, '').trim().slice(0, 70) || 'Empty document...';

    item.innerHTML = `
      <div class="flex items-center justify-between gap-2 mb-1">
        <h4 class="font-display text-sm tracking-wide uppercase truncate ${isActive ? 'text-white' : 'text-[#0A090D]'}">
          ${escapeHtml(note.title || 'UNTITLED')}
        </h4>
        ${note.isPinned ? `<span class="badge-lilac text-[9px] py-0 px-1 font-bold">PIN</span>` : ''}
      </div>
      <p class="note-preview-text text-xs line-clamp-2 leading-tight ${isActive ? 'text-[#DDD6FE]' : 'text-[#4B4556]'} mb-2">
        ${escapeHtml(previewSnippet)}
      </p>
      <div class="flex items-center justify-between text-[10px] font-mono">
        <span class="note-date-text ${isActive ? 'text-[#C06BF0]' : 'text-[#7C3AED]'} font-bold">${dateFormatted}</span>
        <span class="${isActive ? 'text-gray-300' : 'text-gray-500'}">${note.wordCount || 0}W</span>
      </div>
    `;

    item.addEventListener('click', () => {
      selectNote(note.id);
    });

    listContainer.appendChild(item);
  });
}

async function selectNote(id) {
  currentNoteId = id;
  const note = await window.SecondBrainDB.getNote(id);
  if (!note) return;

  const titleInput = document.getElementById('note-title-input');
  const contentTextarea = document.getElementById('note-content-textarea');
  const pinBtn = document.getElementById('btn-pin-note');

  if (titleInput) titleInput.value = note.title || '';
  if (contentTextarea) contentTextarea.value = note.content || '';

  if (pinBtn) {
    if (note.isPinned) {
      pinBtn.classList.remove('btn-outline');
      pinBtn.classList.add('btn-purple');
      pinBtn.textContent = 'PINNED';
    } else {
      pinBtn.classList.remove('btn-purple');
      pinBtn.classList.add('btn-outline');
      pinBtn.textContent = 'PIN';
    }
  }

  updateTelemetryAndPreview();
  renderNotesList(document.getElementById('search-input')?.value.trim().toLowerCase() || '');
}

async function handleCreateNewNote() {
  const newNote = {
    id: 'note_' + Date.now() + '_' + Math.random().toString(36).substr(2, 4),
    title: 'UNTITLED NOTE',
    content: '',
    tags: [],
    isPinned: false,
    isArchived: false,
    wordCount: 0,
    readingTimeMin: 0,
    createdAt: Date.now(),
    updatedAt: Date.now(),
    syncedAt: null,
    dirty: true
  };

  await window.SecondBrainDB.saveNote(newNote);
  await refreshNotesList();
  selectNote(newNote.id);

  const titleInput = document.getElementById('note-title-input');
  if (titleInput) {
    titleInput.focus();
    titleInput.select();
  }

  Zerotsudios.toast('NEW SCRATCHPAD INITIALIZED', 'success');
}

function handleEditorInput() {
  updateTelemetryAndPreview();

  const statusIndicator = document.getElementById('save-status-text');
  if (statusIndicator) {
    statusIndicator.textContent = 'SAVING...';
    statusIndicator.className = 'text-[#C06BF0] font-bold';
  }

  clearTimeout(saveTimeout);
  saveTimeout = setTimeout(async () => {
    await saveCurrentNote();
  }, 350);
}

async function saveCurrentNote() {
  if (!currentNoteId) return;

  const titleInput = document.getElementById('note-title-input');
  const contentTextarea = document.getElementById('note-content-textarea');

  const title = titleInput ? titleInput.value.trim() || 'UNTITLED NOTE' : 'UNTITLED NOTE';
  const content = contentTextarea ? contentTextarea.value : '';

  const words = content.trim().length ? content.trim().split(/\s+/).length : 0;
  const readingTime = Math.ceil(words / 200) || 1;

  const existingNote = (await window.SecondBrainDB.getNote(currentNoteId)) || {};

  const updatedNote = {
    ...existingNote,
    id: currentNoteId,
    title: title,
    content: content,
    wordCount: words,
    readingTimeMin: readingTime,
    updatedAt: Date.now()
  };

  await window.SecondBrainDB.saveNote(updatedNote);
  await refreshNotesList();

  const statusIndicator = document.getElementById('save-status-text');
  if (statusIndicator) {
    statusIndicator.textContent = 'SAVED // LOCAL (IDB)';
    statusIndicator.className = 'text-[#4EE085] font-bold';
  }
}

function updateTelemetryAndPreview() {
  const contentTextarea = document.getElementById('note-content-textarea');
  const previewContainer = document.getElementById('markdown-preview-output');
  const wordCountElem = document.getElementById('telemetry-word-count');
  const charCountElem = document.getElementById('telemetry-char-count');
  const readTimeElem = document.getElementById('telemetry-read-time');

  const content = contentTextarea ? contentTextarea.value : '';
  const words = content.trim().length ? content.trim().split(/\s+/).length : 0;
  const chars = content.length;
  const readTime = Math.ceil(words / 200) || 1;

  if (wordCountElem) wordCountElem.textContent = `${words} WORDS`;
  if (charCountElem) charCountElem.textContent = `${chars} CHARS`;
  if (readTimeElem) readTimeElem.textContent = `${readTime} MIN READ`;

  if (previewContainer && window.marked) {
    previewContainer.innerHTML = marked.parse(content || '*No content yet. Begin typing in the editor...*');
  }
}

async function handleTogglePin() {
  if (!currentNoteId) return;
  const note = await window.SecondBrainDB.getNote(currentNoteId);
  if (!note) return;

  note.isPinned = !note.isPinned;
  await window.SecondBrainDB.saveNote(note);
  await refreshNotesList();
  selectNote(currentNoteId);

  Zerotsudios.toast(note.isPinned ? 'NOTE PINNED' : 'NOTE UNPINNED', 'info');
}

async function handleDeleteNote() {
  if (!currentNoteId) return;

  if (!confirm('CONFIRM DELETION: Remove this note from local storage?')) {
    return;
  }

  await window.SecondBrainDB.deleteNote(currentNoteId);
  Zerotsudios.toast('NOTE DELETED', 'danger');

  await refreshNotesList();
  if (allNotes.length > 0) {
    selectNote(allNotes[0].id);
  } else {
    currentNoteId = null;
    document.getElementById('note-title-input').value = '';
    document.getElementById('note-content-textarea').value = '';
    updateTelemetryAndPreview();
  }
}

async function handleExportNoteMd() {
  if (!currentNoteId) return;
  const note = await window.SecondBrainDB.getNote(currentNoteId);
  if (!note) return;

  const blob = new Blob([note.content || ''], { type: 'text/markdown;charset=utf-8' });
  const filename = `${(note.title || 'untitled').replace(/[^a-z0-9_-]/gi, '_').toLowerCase()}.md`;
  downloadFile(blob, filename);

  Zerotsudios.toast(`EXPORTED // ${filename}`, 'success');
}

async function handleExportVault() {
  const vaultData = await window.SecondBrainDB.exportVault();
  const blob = new Blob([JSON.stringify(vaultData, null, 2)], { type: 'application/json' });
  const filename = `second-brain-vault-${new Date().toISOString().slice(0, 10)}.json`;
  downloadFile(blob, filename);

  Zerotsudios.toast('VAULT BACKUP DOWNLOADED', 'success');
}

async function handleImportVault(e) {
  const file = e.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = async (evt) => {
    try {
      const data = JSON.parse(evt.target.result);
      await window.SecondBrainDB.importVault(data);
      await refreshNotesList();
      if (allNotes.length > 0) {
        selectNote(allNotes[0].id);
      }
      Zerotsudios.toast(`RESTORED ${data.notes?.length || 0} NOTES`, 'success');
    } catch (err) {
      console.error(err);
      Zerotsudios.toast('ERROR PARSING BACKUP FILE', 'danger');
    }
  };
  reader.readAsText(file);
  e.target.value = '';
}

function downloadFile(blob, filename) {
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(link.href);
}

function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}
