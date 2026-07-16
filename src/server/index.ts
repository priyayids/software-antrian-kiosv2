import express, { Router, Request, Response } from 'express';
import fs from 'fs';
import path from 'path';
import { exec } from 'child_process';
import { db, UPLOADS_DIR } from './db';

const router = Router();

// Helper to get today's date in YYYY-MM-DD format (Asia/Jakarta or local)
function getTodayString(): string {
  const d = new Date();
  // Format as YYYY-MM-DD local time
  const offset = d.getTimezoneOffset();
  const localDate = new Date(d.getTime() - (offset * 60 * 1000));
  return localDate.toISOString().split('T')[0];
}

// 1. SETTINGS API
router.get('/settings', (req: Request, res: Response) => {
  res.json(db.getSettings());
});

router.post('/settings', (req: Request, res: Response) => {
  try {
    const updated = db.saveSettings(req.body);
    res.json({ success: true, data: updated });
  } catch (e: any) {
    res.status(500).json({ success: false, message: e.message });
  }
});

// Logo Upload API (Base64)
router.post('/settings/logo', (req: Request, res: Response) => {
  const { filename, base64 } = req.body;
  if (!filename || !base64) {
    return res.status(400).json({ success: false, message: 'Missing filename or base64 data' });
  }

  try {
    // Sanitize filename to prevent directory traversal
    const safeFilename = path.basename(filename);
    const cleanBase64 = base64.replace(/^data:image\/\w+;base64,/, '');
    const buffer = Buffer.from(cleanBase64, 'base64');
    
    fs.writeFileSync(path.join(UPLOADS_DIR, safeFilename), buffer);
    
    // Save to settings
    db.saveSettings({ logo: safeFilename });
    
    res.json({ success: true, filename: safeFilename });
  } catch (e: any) {
    res.status(500).json({ success: false, message: e.message });
  }
});

// Hero Image Upload API (Base64)
router.post('/settings/hero', (req: Request, res: Response) => {
  const { filename, base64 } = req.body;
  if (!filename || !base64) {
    return res.status(400).json({ success: false, message: 'Missing filename or base64 data' });
  }

  try {
    // Sanitize filename to prevent directory traversal
    const safeFilename = path.basename(filename);
    const cleanBase64 = base64.replace(/^data:image\/\w+;base64,/, '');
    const buffer = Buffer.from(cleanBase64, 'base64');
    
    fs.writeFileSync(path.join(UPLOADS_DIR, safeFilename), buffer);
    
    // Save to settings
    db.saveSettings({ hero_image: safeFilename });
    
    res.json({ success: true, filename: safeFilename });
  } catch (e: any) {
    res.status(500).json({ success: false, message: e.message });
  }
});

// Serve local upload files in dev/prod
router.use('/uploads', express.static(UPLOADS_DIR));

// 2. KIOSK / NOMOR API
router.get('/nomor/getAntrian', (req: Request, res: Response) => {
  const today = getTodayString();
  const nextNum = db.getNextNumber(today);
  res.send(nextNum);
});

router.post('/nomor/insert', (req: Request, res: Response) => {
  try {
    const today = getTodayString();
    const item = db.createQueue(today);
    
    res.json({
      success: true,
      no_antrian: item.no_antrian,
      message: 'Nomor antrian berhasil diambil.',
      print_status: 'printed',
      data: item
    });
  } catch (e: any) {
    res.status(500).json({ success: false, message: e.message });
  }
});

// 3. COUNTER / PANGGILAN API
router.get('/panggilan/getAntrian', (req: Request, res: Response) => {
  const today = getTodayString();
  const list = db.getAllQueues(today);
  // PHP code sends: if empty, send [['id' => '', 'no_antrian' => '-', 'status' => '']]
  if (list.length === 0) {
    return res.json({ data: [{ id: '', no_antrian: '-', status: '' }] });
  }
  res.json({ data: list });
});

router.get('/panggilan/getAntrianSekarang', (req: Request, res: Response) => {
  const today = getTodayString();
  const cur = db.getCurrentServing(today);
  res.send(cur || '-');
});

router.get('/panggilan/getAntrianSelanjutnya', (req: Request, res: Response) => {
  const today = getTodayString();
  const nextNum = db.getNextQueue(today);
  res.send(nextNum || '-');
});

router.get('/panggilan/getJumlahAntrian', (req: Request, res: Response) => {
  const today = getTodayString();
  const count = db.getCount(today);
  res.send(String(count));
});

router.get('/panggilan/getSisaAntrian', (req: Request, res: Response) => {
  const today = getTodayString();
  const sisa = db.getRemainingCount(today);
  res.send(String(sisa));
});

// Create Call (Panggilan)
router.post('/panggilan/createPanggilan', (req: Request, res: Response) => {
  const { antrian, loket } = req.body;
  if (!antrian || !loket) {
    return res.status(400).json({ success: false, message: 'Data tidak lengkap' });
  }

  try {
    db.createCall(antrian, loket);
    res.json({
      success: true,
      message: `Success create untuk panggilan ${antrian}`
    });
  } catch (e: any) {
    res.status(500).json({ success: false, message: e.message });
  }
});

// Mark queue as served
router.post('/panggilan/update', (req: Request, res: Response) => {
  const id = parseInt(req.body.id, 10);
  if (isNaN(id)) {
    return res.status(400).json({ success: false, error: 'Invalid ID' });
  }

  try {
    const success = db.markAsServed(id);
    if (success) {
      res.json({ success: true });
    } else {
      res.status(404).json({ success: false, error: 'Queue item not found' });
    }
  } catch (e: any) {
    res.status(500).json({ success: false, error: e.message });
  }
});

// Reset daily queues
router.post('/panggilan/resetDaily', (req: Request, res: Response) => {
  try {
    const today = getTodayString();
    db.resetDaily(today);
    db.resetCalls();
    res.json({ success: true, message: 'Antrian berhasil di-reset untuk hari ini.' });
  } catch (e: any) {
    res.status(500).json({ success: false, message: e.message });
  }
});

// 4. MONITOR / DISPLAY API
// Both GET and POST to support standard AJAX calling
const monitorGetPanggilan = (req: Request, res: Response) => {
  try {
    const calls = db.getAllCalls();
    res.json({
      success: true,
      message: 'Success',
      data: calls
    });
  } catch (e: any) {
    res.status(500).json({ success: false, message: e.message });
  }
};
router.get('/monitor/panggilan', monitorGetPanggilan);
router.post('/monitor/panggilan', monitorGetPanggilan);

// Delete call from ongoing calls list (once announced)
router.post('/monitor/panggilan/delete', (req: Request, res: Response) => {
  const id = parseInt(req.body.id, 10);
  if (isNaN(id)) {
    return res.status(400).json({ success: false, message: 'Invalid ID' });
  }

  try {
    const success = db.deleteCall(id);
    if (success) {
      res.json({ success: true, message: `Delete Success on id ${id}` });
    } else {
      res.status(404).json({ success: false, message: 'Call not found' });
    }
  } catch (e: any) {
    res.status(500).json({ success: false, message: e.message });
  }
});

// 5. DIRECT THERMAL PRINTING API FOR LOCAL WINDOWS WITH GENERIC RAW PRINTER
router.post('/print', (req: Request, res: Response) => {
  const { no_antrian, printer_name, nama_instansi, alamat } = req.body;
  if (!no_antrian) {
    return res.status(400).json({ success: false, message: 'Missing no_antrian' });
  }

  const pName = printer_name && typeof printer_name === 'string' ? printer_name.trim() : '';
  const instansiName = nama_instansi || 'PT NISCAYA UNGGUL NUSANTARA';
  const instansiAlamat = alamat || '';
  
  const todayDate = new Date().toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
  const todayTime = new Date().toLocaleTimeString('id-ID');

  const printText = `
================================
${instansiName.toUpperCase()}
${instansiAlamat}
================================

       NOMOR ANTRIAN ANDA

             ${no_antrian}

  Silakan tunggu nomor Anda dipanggil.
  Nomor ini hanya berlaku pada hari ini.

--------------------------------
Waktu: ${todayTime}
Tanggal: ${todayDate}
--------------------------------
          PT Niscaya
================================




`; // Padding lines for thermal paper feed

  if (process.platform === 'win32') {
    const tempFile = path.join(process.cwd(), `ticket_${Date.now()}_${no_antrian.replace(/[^a-zA-Z0-9]/g, '')}.txt`);
    try {
      fs.writeFileSync(tempFile, printText, 'utf-8');
      
      const cmd = pName
        ? `powershell -Command "Get-Content -LiteralPath '${tempFile}' | Out-Printer -Name '${pName.replace(/'/g, "''")}'"`
        : `powershell -Command "Get-Content -LiteralPath '${tempFile}' | Out-Printer"`;
      
      exec(cmd, (error, stdout, stderr) => {
        try {
          fs.unlinkSync(tempFile);
        } catch (e) {}
        
        if (error) {
          console.error('[PRINT] Windows printing failed:', error, stderr);
          return res.status(500).json({ success: false, message: 'Gagal mencetak tiket ke printer lokal', error: stderr });
        }
        
        return res.json({ success: true, message: 'Berhasil mencetak tiket lewat printer lokal Windows!' });
      });
    } catch (e: any) {
      console.error('[PRINT] Write file error:', e);
      return res.status(500).json({ success: false, message: 'Gagal menyiapkan data cetak', error: e.message });
    }
  } else {
    // Non-windows fallback / log (e.g. Cloud Run, macOS, Linux container)
    console.log(`[PRINT SIMULATION] Platform is not Windows (${process.platform}). Raw print text:`, printText);
    return res.json({ 
      success: true, 
      simulated: true, 
      message: 'Simulasi cetak berhasil (Bukan OS Windows, pencetakan di-bypass).' 
    });
  }
});

// 6. TEXT-TO-SPEECH API (Google Translate TTS proxy)
router.post('/tts', async (req: Request, res: Response) => {
  const { text, lang } = req.body;
  if (!text) {
    return res.status(400).json({ success: false, message: 'Missing text' });
  }

  try {
    const ttsUrl = `https://translate.google.com/translate_tts?ie=UTF-8&tl=${encodeURIComponent(lang || 'id')}&client=tw-ob&q=${encodeURIComponent(text)}`;
    const response = await fetch(ttsUrl);

    if (!response.ok) {
      throw new Error(`Google TTS returned ${response.status}`);
    }

    const audioBuffer = await response.arrayBuffer();
    res.set('Content-Type', 'audio/mpeg');
    res.send(Buffer.from(audioBuffer));
  } catch (e: any) {
    res.status(500).json({ success: false, message: e.message });
  }
});

export { router as apiRouter };
export function setupApi(app: express.Express) {
  app.use('/api', router);
}
