import fs from 'fs';
import path from 'path';
import { AppSettings, QueueItem, PanggilanItem } from '../types';

const STORAGE_DIR = path.join(process.cwd(), 'storage');
const DB_FILE = path.join(STORAGE_DIR, 'db_store.json');
const UPLOADS_DIR = path.join(STORAGE_DIR, 'uploads');

// Ensure storage directories exist
if (!fs.existsSync(STORAGE_DIR)) {
  fs.mkdirSync(STORAGE_DIR, { recursive: true });
}
if (!fs.existsSync(UPLOADS_DIR)) {
  fs.mkdirSync(UPLOADS_DIR, { recursive: true });
}

// Default initial settings matching application_antrian.sql
const DEFAULT_SETTINGS: AppSettings = {
  nama_instansi: 'PT NISCAYA UNGGUL NUSANTARA',
  logo: '',
  alamat: 'Rukan graha mas Jl. Pejuangan No.C 11, RT.1/RW.7, Kebon Jeruk, Kebonjeruk, West Jakarta City, Jakarta 11520',
  telpon: '558450845',
  email: 'priyayi@cubeteknologi.com',
  running_text: 'SELAMAT DATANG',
  youtube_id: 'Srr5BCta8UY',
  list_loket: [
    { no_loket: '1', nama_loket: 'LOKET 1' },
    { no_loket: '2', nama_loket: 'LOKET 2' },
    { no_loket: '3', nama_loket: 'LOKET 3' }
  ],
  warna_primary: '#1e293b',
  warna_secondary: '#ffffff',
  warna_accent: '#2563eb',
  warna_background: '#f1f5f9',
  warna_text: '#ffffff',
  warna_home_bg: '#f8fafc',
  warna_home_text: '#0f172a'
};

interface DatabaseSchema {
  settings: AppSettings;
  queues: QueueItem[];
  calls: PanggilanItem[];
  nextQueueId: number;
  nextCallId: number;
}

const DEFAULT_DB: DatabaseSchema = {
  settings: DEFAULT_SETTINGS,
  queues: [],
  calls: [],
  nextQueueId: 1,
  nextCallId: 1
};

class LocalDatabase {
  private data: DatabaseSchema;

  constructor() {
    this.data = this.load();
  }

  private load(): DatabaseSchema {
    try {
      if (fs.existsSync(DB_FILE)) {
        const raw = fs.readFileSync(DB_FILE, 'utf-8');
        const parsed = JSON.parse(raw);
        return {
          settings: parsed.settings || DEFAULT_SETTINGS,
          queues: parsed.queues || [],
          calls: parsed.calls || [],
          nextQueueId: parsed.nextQueueId || 1,
          nextCallId: parsed.nextCallId || 1
        };
      }
    } catch (e) {
      console.error('Failed to load DB file, resetting to default:', e);
    }
    this.saveToDisk(DEFAULT_DB);
    return JSON.parse(JSON.stringify(DEFAULT_DB));
  }

  private saveToDisk(data: DatabaseSchema) {
    try {
      fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), 'utf-8');
    } catch (e) {
      console.error('Failed to write DB file to disk:', e);
    }
  }

  private persist() {
    this.saveToDisk(this.data);
  }

  // --- SETTINGS ---
  public getSettings(): AppSettings {
    return this.data.settings;
  }

  public saveSettings(settings: Partial<AppSettings>): AppSettings {
    this.data.settings = {
      ...this.data.settings,
      ...settings
    };
    this.persist();
    return this.data.settings;
  }

  // --- QUEUES ---
  public getAllQueues(tanggal: string): QueueItem[] {
    return this.data.queues.filter(q => q.tanggal === tanggal && q.deleted === 0);
  }

  public getNextNumber(tanggal: string): string {
    const todayQueues = this.data.queues.filter(q => q.tanggal === tanggal && q.deleted === 0);
    let nextNum = 1;
    if (todayQueues.length > 0) {
      const nums = todayQueues.map(q => parseInt(q.no_antrian, 10)).filter(n => !isNaN(n));
      if (nums.length > 0) {
        nextNum = Math.max(...nums) + 1;
      }
    }
    return String(nextNum).padStart(3, '0');
  }

  public createQueue(tanggal: string): QueueItem {
    const todayQueues = this.data.queues.filter(q => q.tanggal === tanggal && q.deleted === 0);
    let nextNum = 1;
    if (todayQueues.length > 0) {
      const nums = todayQueues.map(q => parseInt(q.no_antrian, 10)).filter(n => !isNaN(n));
      if (nums.length > 0) {
        nextNum = Math.max(...nums) + 1;
      }
    }
    const noAntrian = String(nextNum).padStart(3, '0');

    const newItem: QueueItem = {
      id: this.data.nextQueueId++,
      tanggal,
      no_antrian: noAntrian,
      status: '0',
      updated_date: null,
      deleted: 0
    };

    this.data.queues.push(newItem);
    this.persist();
    return newItem;
  }

  public deleteQueue(id: number): boolean {
    const item = this.data.queues.find(q => q.id === id);
    if (item) {
      item.deleted = 1;
      this.persist();
      return true;
    }
    return false;
  }

  public getCount(tanggal: string): number {
    return this.getAllQueues(tanggal).length;
  }

  public getRemainingCount(tanggal: string): number {
    return this.getAllQueues(tanggal).filter(q => q.status === '0').length;
  }

  public getCurrentServing(tanggal: string): string | null {
    const served = this.getAllQueues(tanggal)
      .filter(q => q.status === '1')
      .sort((a, b) => {
        const da = a.updated_date ? new Date(a.updated_date).getTime() : 0;
        const db = b.updated_date ? new Date(b.updated_date).getTime() : 0;
        return db - da; // Descending, so most recently served is first
      });
    return served.length > 0 ? served[0].no_antrian : null;
  }

  public getNextQueue(tanggal: string): string | null {
    const waiting = this.getAllQueues(tanggal)
      .filter(q => q.status === '0')
      .sort((a, b) => a.no_antrian.localeCompare(b.no_antrian)); // Ascending, lowest number first
    return waiting.length > 0 ? waiting[0].no_antrian : null;
  }

  public markAsServed(id: number): boolean {
    const item = this.data.queues.find(q => q.id === id);
    if (item) {
      item.status = '1';
      // Local ISO string in Jakarta/local time format (YYYY-MM-DD HH:mm:ss)
      item.updated_date = new Date().toISOString().replace('T', ' ').substring(0, 19);
      this.persist();
      return true;
    }
    return false;
  }

  public resetDaily(tanggal: string): number {
    let count = 0;
    this.data.queues.forEach(q => {
      if (q.tanggal === tanggal && q.deleted === 0) {
        q.deleted = 1;
        count++;
      }
    });
    if (count > 0) {
      this.persist();
    }
    return count;
  }

  // --- CALLS ---
  public createCall(antrian: string, loket: string): PanggilanItem {
    const newItem: PanggilanItem = {
      id: this.data.nextCallId++,
      antrian,
      loket,
      deleted: 0
    };
    this.data.calls.push(newItem);
    this.persist();
    return newItem;
  }

  public getAllCalls(): PanggilanItem[] {
    return this.data.calls.filter(c => c.deleted === 0);
  }

  public deleteCall(id: number): boolean {
    const item = this.data.calls.find(c => c.id === id);
    if (item) {
      item.deleted = 1;
      this.persist();
      return true;
    }
    return false;
  }

  public resetCalls(): boolean {
    let count = 0;
    this.data.calls.forEach(c => {
      if (c.deleted === 0) {
        c.deleted = 1;
        count++;
      }
    });
    if (count > 0) {
      this.persist();
    }
    return true;
  }
}

export const db = new LocalDatabase();
export { STORAGE_DIR, UPLOADS_DIR };
