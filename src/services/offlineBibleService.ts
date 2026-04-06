import { BIBLE_BOOKS, BibleBook, POPULAR_VERSES } from '../data/bible';

const DB_NAME = 'sacred_word_bible';
const DB_VERSION = 1;

interface BibleDBSchema {
  verses: { key: string; bookId: string; chapter: number; verse: number; text: string; version: 'modern' | 'carey' };
  meta: { key: string; data: any };
}

class OfflineBibleService {
  private db: IDBDatabase | null = null;
  private initPromise: Promise<void> | null = null;

  async init(): Promise<void> {
    if (this.db) return;
    if (this.initPromise) return this.initPromise;

    this.initPromise = new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, DB_VERSION);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        this.db = request.result;
        resolve();
      };

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        
        if (!db.objectStoreNames.contains('verses')) {
          const verseStore = db.createObjectStore('verses', { keyPath: 'key' });
          verseStore.createIndex('bookId', 'bookId', { unique: false });
          verseStore.createIndex('chapter', 'chapter', { unique: false });
        }
        
        if (!db.objectStoreNames.contains('meta')) {
          db.createObjectStore('meta', { keyPath: 'key' });
        }
      };
    });

    return this.initPromise;
  }

  private async getStore(storeName: 'verses' | 'meta', mode: IDBTransactionMode = 'readonly'): Promise<IDBObjectStore> {
    await this.init();
    if (!this.db) throw new Error('Database not initialized');
    
    const transaction = this.db.transaction(storeName, mode);
    return transaction.objectStore(storeName);
  }

  async isDownloaded(): Promise<boolean> {
    try {
      await this.init();
      if (!this.db) return false;
      
      const store = this.db.transaction('meta', 'readonly').objectStore('meta');
      return new Promise((resolve) => {
        const request = store.get('downloaded');
        request.onsuccess = () => resolve(!!request.result?.data);
        request.onerror = () => resolve(false);
      });
    } catch {
      return false;
    }
  }

  async getStorageUsage(): Promise<{ used: number; total: string }> {
    try {
      const store = await this.getStore('verses');
      return new Promise((resolve) => {
        const request = store.getAll();
        request.onsuccess = () => {
          const verses = request.result;
          const bytes = JSON.stringify(verses).length;
          resolve({
            used: bytes,
            total: bytes < 1024 ? `${bytes} B` : bytes < 1024 * 1024 ? `${(bytes / 1024).toFixed(1)} KB` : `${(bytes / (1024 * 1024)).toFixed(1)} MB`
          });
        };
        request.onerror = () => resolve({ used: 0, total: '0 B' });
      });
    } catch {
      return { used: 0, total: '0 B' };
    }
  }

  async downloadBible(onProgress?: (progress: number) => void): Promise<void> {
    await this.init();
    
    const store = await this.getStore('verses', 'readwrite');
    let total = POPULAR_VERSES.length;
    let done = 0;

    for (const verse of POPULAR_VERSES) {
      await new Promise<void>((resolve, reject) => {
        const key = `psalms_${verse.chapter}_${verse.verse}`;
        const request = store.put({
          key,
          bookId: 'psalms',
          chapter: verse.chapter,
          verse: verse.verse,
          text: verse.text,
          version: verse.version
        });
        request.onsuccess = () => resolve();
        request.onerror = () => reject(request.error);
      });
      
      done++;
      onProgress?.(Math.round((done / total) * 100));
    }

    const metaStore = await this.getStore('meta', 'readwrite');
    await new Promise<void>((resolve, reject) => {
      const request = metaStore.put({ key: 'downloaded', data: true });
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  async getVerse(book: string, chapter: number, verse: number): Promise<string | null> {
    try {
      const store = await this.getStore('verses');
      const key = `${book}_${chapter}_${verse}`;
      
      return new Promise((resolve) => {
        const request = store.get(key);
        request.onsuccess = () => resolve(request.result?.text || null);
        request.onerror = () => resolve(null);
      });
    } catch {
      return null;
    }
  }

  async searchVerses(query: string, limit: number = 10): Promise<{ book: string; chapter: number; verse: number; text: string }[]> {
    try {
      const store = await this.getStore('verses');
      
      return new Promise((resolve) => {
        const request = store.getAll();
        request.onsuccess = () => {
          const verses = request.result.filter(v => 
            v.text.toLowerCase().includes(query.toLowerCase())
          ).slice(0, limit);
          
          resolve(verses.map(v => ({
            book: v.bookId,
            chapter: v.chapter,
            verse: v.verse,
            text: v.text
          })));
        };
        request.onerror = () => resolve([]);
      });
    } catch {
      return [];
    }
  }

  async clearCache(): Promise<void> {
    try {
      const store = await this.getStore('verses', 'readwrite');
      store.clear();
      
      const metaStore = await this.getStore('meta', 'readwrite');
      metaStore.clear();
    } catch (e) {
      console.error('Failed to clear Bible cache:', e);
    }
  }

  getPopularVerses() {
    return POPULAR_VERSES.map(v => ({
      reference: `গীতসংহিতা ${v.chapter}:${v.verse}`,
      text: v.text
    }));
  }
}

export const offlineBible = new OfflineBibleService();
