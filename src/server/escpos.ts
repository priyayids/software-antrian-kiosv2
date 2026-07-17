import fs from 'fs';
import path from 'path';
import { exec } from 'child_process';

// ESC/POS control bytes. These are the standard command set understood by
// almost every thermal receipt printer (Epson TM-* and the many generic
// 58mm/80mm clones that copy its protocol).
const ESC = 0x1b;
const GS = 0x1d;

const INIT = Buffer.from([ESC, 0x40]); // reset printer to defaults
const ALIGN_CENTER = Buffer.from([ESC, 0x61, 0x01]);
const ALIGN_LEFT = Buffer.from([ESC, 0x61, 0x00]);
const BOLD_ON = Buffer.from([ESC, 0x45, 0x01]);
const BOLD_OFF = Buffer.from([ESC, 0x45, 0x00]);
const SIZE_NORMAL = Buffer.from([GS, 0x21, 0x00]);
const SIZE_BIG = Buffer.from([GS, 0x21, 0x22]); // triple width + triple height
const PARTIAL_CUT = Buffer.from([GS, 0x56, 0x01]);

const line = (text = '') => Buffer.from(text + '\n', 'latin1');

export interface TicketData {
  instansi: string;
  alamat: string;
  noAntrian: string;
  tanggal: string;
  waktu: string;
  paperWidthMm: '58' | '80';
}

/** 58mm printers print ~32 chars/line, 80mm printers ~48, at the default font. */
function charsPerLine(paperWidthMm: '58' | '80'): number {
  return paperWidthMm === '58' ? 32 : 48;
}

function wrapText(text: string, width: number): string[] {
  const words = text.split(' ');
  const lines: string[] = [];
  let current = '';
  for (const word of words) {
    const next = current ? `${current} ${word}` : word;
    if (next.length > width) {
      if (current) lines.push(current);
      current = word;
    } else {
      current = next;
    }
  }
  if (current) lines.push(current);
  return lines;
}

/** Builds the raw ESC/POS byte sequence for one queue ticket. */
export function buildEscPosTicket(data: TicketData): Buffer {
  const width = charsPerLine(data.paperWidthMm);
  const divider = '-'.repeat(width);
  const parts: Buffer[] = [INIT, ALIGN_CENTER];

  parts.push(BOLD_ON);
  for (const l of wrapText(data.instansi.toUpperCase(), width)) parts.push(line(l));
  parts.push(BOLD_OFF);
  for (const l of wrapText(data.alamat, width)) parts.push(line(l));

  parts.push(line(divider));
  parts.push(line('NOMOR ANTRIAN ANDA'));
  parts.push(line());

  parts.push(BOLD_ON, SIZE_BIG);
  parts.push(line(data.noAntrian));
  parts.push(SIZE_NORMAL, BOLD_OFF);
  parts.push(line());

  for (const l of wrapText('Silakan menunggu hingga nomor antrian Anda dipanggil.', width)) parts.push(line(l));
  for (const l of wrapText('Nomor ini hanya berlaku pada hari ini.', width)) parts.push(line(l));

  parts.push(line(divider));
  parts.push(line(data.tanggal));
  parts.push(line(`Pukul: ${data.waktu}`));

  parts.push(BOLD_ON);
  parts.push(line('TERIMA KASIH'));
  parts.push(BOLD_OFF, ALIGN_LEFT);

  parts.push(line(), line(), line());
  parts.push(PARTIAL_CUT);

  return Buffer.concat(parts);
}

/**
 * Sends raw ESC/POS bytes straight to a Windows printer via the WinSpool
 * "RAW" data type, bypassing the print driver's page layout entirely.
 * This is what prevents the ticket from being rotated/rescaled - unlike
 * `Out-Printer`, there is no GDI "page" involved, so the driver's default
 * paper orientation can't rotate the content.
 */
export function printRawToWindowsPrinter(bytes: Buffer, printerName: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const stamp = Date.now();
    const dataFile = path.join(process.cwd(), `ticket_${stamp}.bin`);
    const scriptFile = path.join(process.cwd(), 'scripts', 'raw-print.ps1');

    try {
      fs.writeFileSync(dataFile, bytes);
    } catch (e: any) {
      return reject(new Error(`Gagal menulis file data cetak: ${e.message}`));
    }

    const nameArg = printerName ? ` -PrinterName '${printerName.replace(/'/g, "''")}'` : '';
    const cmd = `powershell -NoProfile -ExecutionPolicy Bypass -File "${scriptFile}"${nameArg} -DataFile "${dataFile}"`;

    exec(cmd, (error, stdout, stderr) => {
      try { fs.unlinkSync(dataFile); } catch { /* best effort cleanup */ }

      if (error) {
        return reject(new Error(stderr || stdout || error.message));
      }
      resolve();
    });
  });
}
