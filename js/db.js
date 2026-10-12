/**
 * SECOND BRAIN // IndexedDB Persistence Engine
 * Zero-budget, offline-first client storage
 */

const DB_NAME = 'second_brain_db';
const DB_VERSION = 1;
const STORE_NAME = 'notes';

class SecondBrainDB {
  constructor() {
    this.db = null;
  }

  async init() {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, DB_VERSION);

      request.onupgradeneeded = (event) => {
        const db = event.target.result;
        if (!db.objectStoreNames.contains(STORE_NAME)) {
          const store = db.createObjectStore(STORE_NAME, { keyPath: 'id' });
          store.createIndex('updatedAt', 'updatedAt', { unique: false });
          store.createIndex('createdAt', 'createdAt', { unique: false });
          store.createIndex('isPinned', 'isPinned', { unique: false });
        }
      };

      request.onsuccess = async (event) => {
        this.db = event.target.result;
        // Check if database is empty, seed welcome note if needed
        const notes = await this.getAllNotes();
        if (notes.length === 0) {
          await this.seedInitialNote();
        }
        resolve(this.db);
      };

      request.onerror = (event) => {
        console.error('IndexedDB error:', event.target.error);
        reject(event.target.error);
      };
    });
  }

  async getAllNotes() {
    return new Promise((resolve, reject) => {
      const tx = this.db.transaction(STORE_NAME, 'readonly');
      const store = tx.objectStore(STORE_NAME);
      const request = store.getAll();

      request.onsuccess = () => {
        const notes = request.result || [];
        // Sort: pinned first, then by updatedAt descending
        notes.sort((a, b) => {
          if (a.isPinned && !b.isPinned) return -1;
          if (!a.isPinned && b.isPinned) return 1;
          return (b.updatedAt || 0) - (a.updatedAt || 0);
        });
        resolve(notes);
      };

      request.onerror = () => reject(request.error);
    });
  }

  async getNote(id) {
    return new Promise((resolve, reject) => {
      const tx = this.db.transaction(STORE_NAME, 'readonly');
      const store = tx.objectStore(STORE_NAME);
      const request = store.get(id);

      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  async saveNote(note) {
    return new Promise((resolve, reject) => {
      const tx = this.db.transaction(STORE_NAME, 'readwrite');
      const store = tx.objectStore(STORE_NAME);
      
      const payload = {
        ...note,
        updatedAt: Date.now()
      };

      const request = store.put(payload);

      request.onsuccess = () => resolve(payload);
      request.onerror = () => reject(request.error);
    });
  }

  async deleteNote(id) {
    return new Promise((resolve, reject) => {
      const tx = this.db.transaction(STORE_NAME, 'readwrite');
      const store = tx.objectStore(STORE_NAME);
      const request = store.delete(id);

      request.onsuccess = () => resolve(true);
      request.onerror = () => reject(request.error);
    });
  }

  async exportVault() {
    const notes = await this.getAllNotes();
    const vaultData = {
      app: 'SECOND-BRAIN',
      version: '1.0',
      exportedAt: new Date().toISOString(),
      notesCount: notes.length,
      notes: notes
    };
    return vaultData;
  }

  async importVault(vaultData) {
    if (!vaultData || !Array.isArray(vaultData.notes)) {
      throw new Error('Invalid vault backup format');
    }

    const tx = this.db.transaction(STORE_NAME, 'readwrite');
    const store = tx.objectStore(STORE_NAME);

    for (const note of vaultData.notes) {
      if (note.id && note.title !== undefined) {
        store.put(note);
      }
    }

    return new Promise((resolve, reject) => {
      tx.oncomplete = () => resolve(true);
      tx.onerror = () => reject(tx.error);
    });
  }

  async seedInitialNote() {
    const welcomeNote = {
      id: 'welcome-guide',
      title: 'WELCOME TO SECOND BRAIN // PROTOCOL 01',
      content: `# SECOND BRAIN // SYSTEM INITIALIZED

Welcome to your **distraction-free, offline-first markdown scratchpad & knowledge base**.

---

### CORE CAPABILITIES
- **100% Offline-First**: Stored locally in your browser's IndexedDB. Zero latency, zero cloud dependency.
- **Zerotsu - Studio UI**: Neobrutalist high-contrast dossier styling with mechanical shadows & telemetry.
- **Live Markdown Compilation**: Instant side-by-side preview panel.
- **Data Portability**: Export any note as \`.md\` or backup the entire vault as \`.json\`.

---

### QUICK SHORTCUTS & USAGE
- Use the **+ NEW NOTE** button to initialize a fresh document.
- Edit your title or content directly; auto-save writes to local disk in real-time.
- Click the **PIN** button to anchor essential reference cards to the top.

---

> "Clear your mind. Offload your thoughts into the second brain."
`,
      tags: ['guide', 'getting-started'],
      isPinned: true,
      isArchived: false,
      wordCount: 110,
      readingTimeMin: 1,
      createdAt: Date.now(),
      updatedAt: Date.now(),
      syncedAt: null,
      dirty: false
    };

    return this.saveNote(welcomeNote);
  }
}

window.SecondBrainDB = new SecondBrainDB();
