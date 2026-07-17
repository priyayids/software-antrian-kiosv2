export interface LoketItem {
  no_loket: string;
  nama_loket: string;
}

export interface AppSettings {
  nama_instansi: string;
  logo: string;
  alamat: string;
  telpon: string;
  email: string;
  running_text: string;
  youtube_id: string;
  list_loket: LoketItem[];
  warna_primary: string;
  warna_secondary: string;
  warna_accent: string;
  warna_background: string;
  warna_text: string;
  warna_home_bg?: string;
  warna_home_text?: string;
  printer_type?: 'browser' | 'fully_kiosk' | 'windows_local';
  printer_name?: string;
  printer_paper_width?: '58' | '80';
  hero_image?: string;
  hero_opacity?: number;
}

export interface QueueItem {
  id: number;
  tanggal: string;
  no_antrian: string;
  status: '0' | '1'; // '0' = waiting, '1' = called
  updated_date: string | null;
  deleted: number; // 0 or 1
}

export interface PanggilanItem {
  id: number;
  antrian: string;
  loket: string;
  deleted: number; // 0 or 1
}

export interface QueueStats {
  total: number;
  sekarang: string;
  selanjutnya: string;
  sisa: number;
}
