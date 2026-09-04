const DB_NAME = 'TriadSandbox';
const DB_VERSION = 1;

const DB = {
  db: null,

  async init() {
    return new Promise((resolve, reject) => {
      const req = indexedDB.open(DB_NAME, DB_VERSION);
      req.onerror = () => reject(req.error);
      req.onsuccess = () => { this.db = req.result; resolve(); };
      req.onupgradeneeded = e => {
        const db = e.target.result;
        if (!db.objectStoreNames.contains('sessions')) {
          const store = db.createObjectStore('sessions', { keyPath: 'id' });
          store.createIndex('updatedAt', 'updatedAt', { unique: false });
        }
        if (!db.objectStoreNames.contains('settings')) {
          db.createObjectStore('settings', { keyPath: 'key' });
        }
      };
    });
  },

  async saveSession(session) {
    const tx = this.db.transaction('sessions', 'readwrite');
    tx.objectStore('sessions').put(session);
    return new Promise((resolve, reject) => {
      tx.oncomplete = resolve;
      tx.onerror = () => reject(tx.error);
    });
  },

  async getSession(id) {
    return new Promise((resolve, reject) => {
      const tx = this.db.transaction('sessions', 'readonly');
      const req = tx.objectStore('sessions').get(id);
      req.onsuccess = () => resolve(req.result);
      req.onerror = () => reject(req.error);
    });
  },

  async getAllSessions() {
    return new Promise((resolve, reject) => {
      const tx = this.db.transaction('sessions', 'readonly');
      const store = tx.objectStore('sessions');
      const index = store.index('updatedAt');
      const sessions = [];
      const req = index.openCursor(null, 'prev');
      req.onsuccess = e => {
        const cursor = e.target.result;
        if (cursor) { sessions.push(cursor.value); cursor.continue(); }
        else resolve(sessions);
      };
      req.onerror = () => reject(req.error);
    });
  },

  async deleteSession(id) {
    const tx = this.db.transaction('sessions', 'readwrite');
    tx.objectStore('sessions').delete(id);
    return new Promise((resolve, reject) => {
      tx.oncomplete = resolve;
      tx.onerror = () => reject(tx.error);
    });
  },

  async setSetting(key, value) {
    const tx = this.db.transaction('settings', 'readwrite');
    tx.objectStore('settings').put({ key, value });
    return new Promise((resolve, reject) => {
      tx.oncomplete = resolve;
      tx.onerror = () => reject(tx.error);
    });
  },

  async getSetting(key) {
    return new Promise((resolve, reject) => {
      const tx = this.db.transaction('settings', 'readonly');
      const req = tx.objectStore('settings').get(key);
      req.onsuccess = () => resolve(req.result ? req.result.value : null);
      req.onerror = () => reject(req.error);
    });
  }
};