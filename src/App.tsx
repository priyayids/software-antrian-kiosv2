import { useState, useEffect, useRef, FormEvent } from 'react';
import { 
  Tv, 
  Printer, 
  UserCheck, 
  Settings, 
  Home, 
  Plus, 
  Trash2, 
  RotateCcw, 
  Volume2, 
  VolumeX, 
  Upload, 
  Sparkles, 
  RefreshCw, 
  Clock, 
  Calendar,
  AlertTriangle,
  Play,
  Pause,
  ExternalLink,
  ChevronRight,
  Info,
  Usb
} from 'lucide-react';
import { AppSettings, QueueItem, PanggilanItem, QueueStats } from './types';

const FOOTER_COPYRIGHT = '© 2026 Niscaya. All rights reserved.';

export default function App() {
  const [view, setView] = useState<'home' | 'kiosk' | 'counter' | 'monitor' | 'settings'>('home');
  const [settings, setSettings] = useState<AppSettings | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [showKioskNav, setShowKioskNav] = useState<boolean>(false); // Lock kiosk view navigation by default
  const [showMonitorNav, setShowMonitorNav] = useState<boolean>(false); // Lock monitor view navigation by default
  const [showCounterNav, setShowCounterNav] = useState<boolean>(false); // Lock counter view navigation by default
  
  // Setup Hash Routing (allows separate monitors/tabs to open separate views)
  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.replace('#', '');
      if (['home', 'kiosk', 'counter', 'monitor', 'settings'].includes(hash)) {
        setView(hash as any);
      } else {
        setView('home');
      }
      setShowKioskNav(false); // secure kiosk panel on hash-based router switches
      setShowMonitorNav(false); // secure monitor panel on hash-based router switches
      setShowCounterNav(false); // secure counter panel on hash-based router switches
    };
    
    handleHashChange();
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  // Fetch Settings
  const fetchSettings = async () => {
    try {
      const res = await fetch('/api/settings');
      if (res.ok) {
        const data = await res.json();
        setSettings(data);
      }
    } catch (e) {
      console.error('Error fetching settings:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  // Set view inside hash
  const navigateTo = (newView: 'home' | 'kiosk' | 'counter' | 'monitor' | 'settings') => {
    window.location.hash = newView;
    setView(newView);
    setShowKioskNav(false); // Lock navigation again for the next kiosk session
    setShowMonitorNav(false); // Lock navigation again for the next monitor session
    setShowCounterNav(false); // Lock navigation again for the next counter session
  };

  // Inject Custom Dynamic Theme styles
  useEffect(() => {
    if (!settings) return;
    
    const styleId = 'dynamic-custom-theme';
    let styleElement = document.getElementById(styleId);
    if (!styleElement) {
      styleElement = document.createElement('style');
      styleElement.id = styleId;
      document.head.appendChild(styleElement);
    }
    
    styleElement.innerHTML = `
      :root {
        --color-primary: ${settings.warna_primary || '#020202'};
        --color-secondary: ${settings.warna_secondary || '#ffffff'};
        --color-accent: ${settings.warna_accent || '#6083a9'};
        --color-bg: ${settings.warna_background || '#ffffff'};
        --color-text: ${settings.warna_text || '#ffffff'};
      }
    `;
  }, [settings]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center text-slate-200">
        <RefreshCw className="w-12 h-12 animate-spin text-blue-500 mb-4" />
        <h2 className="text-xl font-medium">Memuat Aplikasi Antrian...</h2>
        <p className="text-slate-400 text-sm mt-1">Menghubungkan ke database lokal</p>
      </div>
    );
  }

  // Floating Navigation Bar (Easy view-switching for AI Studio Preview)
  const navDock = (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-slate-900/90 backdrop-blur-md border border-slate-800 px-6 py-3.5 rounded-full shadow-2xl flex items-center gap-6 z-50 transition-all hover:scale-[1.02]">
      <button 
        onClick={() => navigateTo('home')} 
        className={`flex flex-col items-center gap-1 text-xs font-medium transition-all ${view === 'home' ? 'text-blue-400 scale-110' : 'text-slate-400 hover:text-slate-200'}`}
        title="Beranda"
      >
        <Home className="w-5 h-5" />
        <span>Menu</span>
      </button>
      <div className="w-[1px] h-6 bg-slate-800" />
      <button 
        onClick={() => navigateTo('kiosk')} 
        className={`flex flex-col items-center gap-1 text-xs font-medium transition-all ${view === 'kiosk' ? 'text-emerald-400 scale-110' : 'text-slate-400 hover:text-slate-200'}`}
        title="Kios Cetak Antrian"
      >
        <Printer className="w-5 h-5" />
        <span>Kios</span>
      </button>
      <button 
        onClick={() => navigateTo('counter')} 
        className={`flex flex-col items-center gap-1 text-xs font-medium transition-all ${view === 'counter' ? 'text-amber-400 scale-110' : 'text-slate-400 hover:text-slate-200'}`}
        title="Panggilan Loket"
      >
        <UserCheck className="w-5 h-5" />
        <span>Operator</span>
      </button>
      <button 
        onClick={() => navigateTo('monitor')} 
        className={`flex flex-col items-center gap-1 text-xs font-medium transition-all ${view === 'monitor' ? 'text-indigo-400 scale-110' : 'text-slate-400 hover:text-slate-200'}`}
        title="Monitor Display"
      >
        <Tv className="w-5 h-5" />
        <span>Monitor</span>
      </button>
      <button 
        onClick={() => navigateTo('settings')} 
        className={`flex flex-col items-center gap-1 text-xs font-medium transition-all ${view === 'settings' ? 'text-pink-400 scale-110' : 'text-slate-400 hover:text-slate-200'}`}
        title="Pengaturan"
      >
        <Settings className="w-5 h-5" />
        <span>Setting</span>
      </button>
    </div>
  );

  return (
    <div className="min-h-screen text-slate-800 transition-colors duration-300">
      {view === 'home' && <HomeView settings={settings!} onNavigate={navigateTo} />}
      {view === 'kiosk' && (
        <KioskView 
          settings={settings!} 
          showNav={showKioskNav} 
          onToggleNav={() => setShowKioskNav(!showKioskNav)} 
        />
      )}
      {view === 'counter' && (
        <CounterView 
          settings={settings!} 
          showNav={showCounterNav} 
          onToggleNav={() => setShowCounterNav(!showCounterNav)} 
        />
      )}
      {view === 'monitor' && (
        <MonitorView 
          settings={settings!} 
          showNav={showMonitorNav} 
          onToggleNav={() => setShowMonitorNav(!showMonitorNav)} 
        />
      )}
      {view === 'settings' && <SettingsView settings={settings!} onUpdate={fetchSettings} />}
      
      {/* App Floating Dock - Hidden on kiosk/monitor page unless toggled */}
      {(view !== 'kiosk' || showKioskNav) && (view !== 'monitor' || showMonitorNav) && (view !== 'counter' || showCounterNav) && navDock}
    </div>
  );
}

// ==========================================
// 1. HOME VIEW (HUB PANEL)
// ==========================================
function HomeView({ settings, onNavigate }: { settings: AppSettings, onNavigate: (v: any) => void }) {
  const logoUrl = settings.logo ? `/api/uploads/${settings.logo}` : '/favicon.png';
  const homeBg = settings.warna_home_bg || '#f8fafc';
  const homeText = settings.warna_home_text || '#0f172a';

  return (
    <div 
      className="min-h-screen flex flex-col justify-between py-12 px-6 relative overflow-hidden transition-colors duration-300"
      style={{ backgroundColor: homeBg, color: homeText }}
    >
      {/* Optional Background Hero Image */}
      {settings.hero_image && (
        <div 
          className="absolute inset-0 pointer-events-none"
          style={{
            backgroundImage: `url(/api/uploads/${settings.hero_image})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            opacity: settings.hero_opacity ?? 0.2,
            zIndex: 0
          }}
        />
      )}
      {/* Background Subtle Highlights */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-500/5 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-emerald-500/5 rounded-full blur-[120px] pointer-events-none" />

      <div className="max-w-5xl mx-auto w-full z-10 flex-1 flex flex-col justify-center">
        {/* Header */}
        <div className="text-center mb-12 animate-fade-in">
          <div className="inline-flex items-center justify-center p-3.5 bg-white border border-slate-200/80 rounded-3xl mb-5 shadow-sm">
            <img 
              src={logoUrl} 
              alt="Logo" 
              className="h-16 w-auto object-contain"
              onError={(e) => { 
                const target = e.target as HTMLImageElement;
                if (!target.src.endsWith('/favicon.png')) {
                  target.src = '/favicon.png';
                } else {
                  target.src = 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7';
                }
              }}
            />
          </div>
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-2.5 uppercase" style={{ color: homeText }}>
            {settings.nama_instansi}
          </h1>
          <p className="max-w-xl mx-auto text-sm md:text-base opacity-75">
            {settings.alamat}
          </p>
          <div className="flex justify-center gap-4 text-xs opacity-60 mt-3 font-semibold">
            <span>Tlp: {settings.telpon}</span>
            <span>•</span>
            <span>Email: {settings.email}</span>
          </div>
        </div>

        {/* Action Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
          {/* Card 1: Kios */}
          <button 
            onClick={() => onNavigate('kiosk')}
            className="group relative bg-white/90 hover:bg-white border border-slate-200/80 hover:border-emerald-500/50 p-6 rounded-2xl shadow-md hover:shadow-xl text-left transition-all duration-300 hover:-translate-y-1 overflow-hidden"
          >
            <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl inline-block mb-4 border border-emerald-100">
              <Printer className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-slate-800 mb-1 group-hover:text-emerald-600 transition-colors">KIOS ANTRIAN</h3>
            <p className="text-slate-500 text-xs leading-relaxed">
              Layar pencetak tiket nomor antrian untuk dipasang di lobby depan atau mesin kiosk cetak.
            </p>
            <div className="mt-4 flex items-center gap-1.5 text-xs font-semibold text-emerald-600 opacity-0 group-hover:opacity-100 transition-opacity">
              <span>Buka Panel</span>
              <ChevronRight className="w-3 h-3" />
            </div>
          </button>

          {/* Card 2: Operator */}
          <button 
            onClick={() => onNavigate('counter')}
            className="group relative bg-white/90 hover:bg-white border border-slate-200/80 hover:border-amber-500/50 p-6 rounded-2xl shadow-md hover:shadow-xl text-left transition-all duration-300 hover:-translate-y-1 overflow-hidden"
          >
            <div className="p-3 bg-amber-50 text-amber-600 rounded-xl inline-block mb-4 border border-amber-100">
              <UserCheck className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-slate-800 mb-1 group-hover:text-amber-600 transition-colors">OPERATOR LOKET</h3>
            <p className="text-slate-500 text-xs leading-relaxed">
              Layar kontrol operator untuk memanggil antrian berikutnya, memanggil ulang, atau menyudahi antrian.
            </p>
            <div className="mt-4 flex items-center gap-1.5 text-xs font-semibold text-amber-600 opacity-0 group-hover:opacity-100 transition-opacity">
              <span>Buka Panel</span>
              <ChevronRight className="w-3 h-3" />
            </div>
          </button>

          {/* Card 3: Monitor Display */}
          <button 
            onClick={() => onNavigate('monitor')}
            className="group relative bg-white/90 hover:bg-white border border-slate-200/80 hover:border-indigo-500/50 p-6 rounded-2xl shadow-md hover:shadow-xl text-left transition-all duration-300 hover:-translate-y-1 overflow-hidden"
          >
            <div className="p-3 bg-indigo-50 text-indigo-600 rounded-xl inline-block mb-4 border border-indigo-100">
              <Tv className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-slate-800 mb-1 group-hover:text-indigo-600 transition-colors">MONITOR DISPLAY</h3>
            <p className="text-slate-500 text-xs leading-relaxed">
              Layar TV publik yang menampilkan nomor saat ini, video background, teks berjalan, & audio suara panggil.
            </p>
            <div className="mt-4 flex items-center gap-1.5 text-xs font-semibold text-indigo-600 opacity-0 group-hover:opacity-100 transition-opacity">
              <span>Buka Panel</span>
              <ChevronRight className="w-3 h-3" />
            </div>
          </button>

          {/* Card 4: Settings */}
          <button 
            onClick={() => onNavigate('settings')}
            className="group relative bg-white/90 hover:bg-white border border-slate-200/80 hover:border-pink-500/50 p-6 rounded-2xl shadow-md hover:shadow-xl text-left transition-all duration-300 hover:-translate-y-1 overflow-hidden"
          >
            <div className="p-3 bg-pink-50 text-pink-600 rounded-xl inline-block mb-4 border border-pink-100">
              <Settings className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-slate-800 mb-1 group-hover:text-pink-600 transition-colors">PENGATURAN</h3>
            <p className="text-slate-500 text-xs leading-relaxed">
              Atur logo, nama instansi, alamat kontak, running text ticker, list loket/kounter, warna tema & YouTube video.
            </p>
            <div className="mt-4 flex items-center gap-1.5 text-xs font-semibold text-pink-600 opacity-0 group-hover:opacity-100 transition-opacity">
              <span>Buka Panel</span>
              <ChevronRight className="w-3 h-3" />
            </div>
          </button>
        </div>
      </div>

      <div className="text-center text-xs opacity-60 mt-8 font-medium relative z-10">
        {FOOTER_COPYRIGHT}
      </div>
    </div>
  );
}

// ==========================================
// 2. KIOSK VIEW (PRINT ENGINES)
// ==========================================
function KioskView({ settings, showNav, onToggleNav }: { settings: AppSettings, showNav: boolean, onToggleNav: () => void }) {
  const [nextNumber, setNextNumber] = useState<string>('001');
  const [lastPrinted, setLastPrinted] = useState<string | null>(null);
  const [printLoading, setPrintLoading] = useState<boolean>(false);
  const [showReceipt, setShowReceipt] = useState<boolean>(false);
  const [printError, setPrintError] = useState<boolean>(false);
  const logoUrl = settings.logo ? `/api/uploads/${settings.logo}` : '/favicon.png';
  const webusbDeviceRef = useRef<USBDevice | null>(null);

  const wrapText = (text: string, width: number): string[] => {
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
  };

  const buildEscPosTicketBrowser = (data: {
    instansi: string;
    alamat: string;
    noAntrian: string;
    tanggal: string;
    waktu: string;
    paperWidthMm: '58' | '80';
  }): Uint8Array => {
    const width = data.paperWidthMm === '58' ? 32 : 48;
    const parts: Uint8Array[] = [];

    const push = (...bytes: number[]) => parts.push(new Uint8Array(bytes));
    const pushText = (text: string) => {
      parts.push(new TextEncoder().encode(text + '\n'));
    };

    push(0x1b, 0x40);
    push(0x1b, 0x61, 0x01);
    push(0x1b, 0x45, 0x01);
    for (const l of wrapText(data.instansi.toUpperCase(), width)) pushText(l);
    push(0x1b, 0x45, 0x00);
    for (const l of wrapText(data.alamat, width)) pushText(l);
    pushText('-'.repeat(width));
    pushText('NOMOR ANTRIAN ANDA');
    pushText('');
    push(0x1b, 0x45, 0x01);
    push(0x1d, 0x21, 0x22);
    pushText(data.noAntrian);
    push(0x1d, 0x21, 0x00);
    push(0x1b, 0x45, 0x00);
    pushText('');
    for (const l of wrapText('Silakan menunggu hingga nomor antrian Anda dipanggil.', width)) pushText(l);
    for (const l of wrapText('Nomor ini hanya berlaku pada hari ini.', width)) pushText(l);
    pushText('-'.repeat(width));
    pushText(data.tanggal);
    pushText(`Pukul: ${data.waktu}`);
    push(0x1b, 0x45, 0x01);
    pushText('TERIMA KASIH');
    push(0x1b, 0x45, 0x00);
    push(0x1b, 0x61, 0x00);
    pushText('');
    pushText('');
    pushText('');
    push(0x1d, 0x56, 0x01);

    let totalLen = 0;
    for (const p of parts) totalLen += p.length;
    const result = new Uint8Array(totalLen);
    let offset = 0;
    for (const p of parts) { result.set(p, offset); offset += p.length; }
    return result;
  };

  const getWebUsbDevice = async (): Promise<USBDevice | null> => {
    const saved = localStorage.getItem('webusb_pairing');
    if (!saved) return null;
    let pair: { vendorId: number; productId: number };
    try { pair = JSON.parse(saved); } catch { return null; }
    try {
      const devices = await navigator.usb.getDevices();
      const match = devices.find(d => d.vendorId === pair.vendorId && d.productId === pair.productId);
      if (!match) return null;
      if (!match.opened) {
        await match.open();
        await match.selectConfiguration(1);
        await match.claimInterface(0);
      }
      return match;
    } catch { return null; }
  };

  useEffect(() => {
    if (settings.printer_type === 'webusb') {
      getWebUsbDevice().then(d => { webusbDeviceRef.current = d; });
    }
  }, [settings.printer_type]);

  const triggerWebUsbPrint = async (no_antrian: string) => {
    const device = webusbDeviceRef.current || await getWebUsbDevice();
    if (!device) { setPrintError(true); return; }
    webusbDeviceRef.current = device;
    try {
      const paperWidthMm = settings.printer_paper_width || '80';
      const ticketBytes = buildEscPosTicketBrowser({
        instansi: settings.nama_instansi,
        alamat: settings.alamat,
        noAntrian: no_antrian,
        tanggal: new Date().toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }),
        waktu: new Date().toLocaleTimeString('id-ID'),
        paperWidthMm: paperWidthMm as '58' | '80'
      });
      const iface = device.configuration?.interfaces?.[0];
      const endpoint = iface?.alternate?.endpoints?.find(e => e.direction === 'out');
      if (endpoint) {
        await device.transferOut(endpoint.endpointNumber, ticketBytes);
      }
    } catch (e) {
      console.error('WebUSB print failed:', e);
      setPrintError(true);
    }
  };

  const triggerBrowserPrint = (no_antrian: string) => {
    try {
      // Find or create offscreen iframe with correct layout dimensions
      let iframe = document.getElementById('print-iframe') as HTMLIFrameElement;
      if (!iframe) {
        iframe = document.createElement('iframe');
        iframe.id = 'print-iframe';
        iframe.style.position = 'absolute';
        iframe.style.left = '-9999px';
        iframe.style.top = '-9999px';
        iframe.style.width = '320px';
        iframe.style.height = '600px';
        iframe.style.border = 'none';
        document.body.appendChild(iframe);
      }

      const paperWidthMm = settings.printer_paper_width || '80';
      const contentWidthMm = Number(paperWidthMm) - 8;

      const printContent = `
        <html>
          <head>
            <title>Cetak Tiket - ${no_antrian}</title>
            <style>
              @page {
                size: ${paperWidthMm}mm auto;
                margin: 0mm;
              }
              @media print {
                @page {
                  size: ${paperWidthMm}mm auto;
                  margin: 0mm;
                }
                html, body {
                  margin: 0;
                  padding: 0;
                  width: 100%;
                }
              }
              body { 
                font-family: Arial, Helvetica, sans-serif; 
                text-align: center; 
                padding: 15px 10px; 
                color: #000; 
                width: ${contentWidthMm}mm; 
                margin: 0 auto; 
                box-sizing: border-box;
                background-color: #fff;
              }
              .receipt-container {
                page-break-inside: avoid;
                page-break-after: avoid;
                width: 100%;
              }
              h2 { 
                margin: 0 0 5px 0; 
                font-size: 14px; 
                text-transform: uppercase; 
                font-weight: bold; 
                line-height: 1.2;
              }
              .address { 
                font-size: 9px; 
                margin: 3px 0 8px 0; 
                color: #333; 
                line-height: 1.3;
              }
              .title {
                font-size: 11px;
                font-weight: bold;
                letter-spacing: 0.5px;
                margin: 8px 0 2px 0;
              }
              .num { 
                font-size: 54px; 
                font-weight: 900; 
                margin: 5px 0; 
                line-height: 1;
              }
              .note { 
                font-size: 9px; 
                margin: 3px 0; 
                line-height: 1.2;
              }
              .datetime {
                font-size: 9px;
                margin: 8px 0 4px 0;
              }
              .footer { 
                font-size: 10px; 
                margin-top: 10px; 
                border-top: 1px dashed #000; 
                padding-top: 8px; 
                font-weight: bold;
                text-transform: uppercase;
              }
              hr { border-top: 1px dashed #000; border-bottom: none; margin: 6px 0; }
            </style>
          </head>
          <body>
            <div class="receipt-container">
              <h2>${settings.nama_instansi}</h2>
              <div class="address">${settings.alamat}</div>
              <hr/>
              <div class="title">NOMOR ANTRIAN ANDA</div>
              <div class="num">${no_antrian}</div>
              <div class="note">Silakan menunggu hingga nomor antrian Anda dipanggil.</div>
              <div class="note">Nomor ini hanya berlaku pada hari ini.</div>
              <hr/>
              <div class="datetime">${new Date().toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</div>
              <div class="datetime">Pukul: ${new Date().toLocaleTimeString('id-ID')}</div>
              <div class="footer">TERIMA KASIH</div>
            </div>
          </body>
        </html>
      `;

      const doc = iframe.contentWindow?.document || iframe.contentDocument;
      if (doc) {
        doc.open();
        doc.write(printContent);
        doc.close();

        // Give a tiny moment for content initialization, then trigger print
        setTimeout(() => {
          if (iframe.contentWindow) {
            iframe.contentWindow.focus();
            iframe.contentWindow.print();
          }
        }, 150);
      } else {
        setPrintError(true);
      }
    } catch (err) {
      console.error('Error printing browser:', err);
      setPrintError(true);
    }
  };

  const triggerPrint = async (no_antrian: string) => {
    setPrintError(false);
    const pType = settings.printer_type || 'browser';

    if (pType === 'windows_local') {
      try {
        const res = await fetch('/api/print', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            no_antrian,
            printer_name: settings.printer_name,
            nama_instansi: settings.nama_instansi,
            alamat: settings.alamat,
            printer_paper_width: settings.printer_paper_width
          })
        });
        if (!res.ok) {
          const data = await res.json();
          throw new Error(data.message || 'Gagal cetak');
        }
      } catch (err) {
        console.error('Error printing windows_local:', err);
        setPrintError(true);
      }
    } else if (pType === 'fully_kiosk') {
      const paperWidthMm = settings.printer_paper_width || '80';
      const contentWidthMm = Number(paperWidthMm) - 8;

      const printHtml = `
        <html>
          <head>
            <title>Cetak Tiket - ${no_antrian}</title>
            <style>
              @page {
                size: ${paperWidthMm}mm auto;
                margin: 0mm;
              }
              body { 
                font-family: Arial, Helvetica, sans-serif; 
                text-align: center; 
                padding: 10px 5px; 
                color: #000; 
                width: ${contentWidthMm}mm; 
                margin: 0 auto; 
                box-sizing: border-box;
                background-color: #fff;
              }
              .receipt-container {
                width: 100%;
              }
              h2 { 
                margin: 0 0 5px 0; 
                font-size: 14px; 
                text-transform: uppercase; 
                font-weight: bold; 
                line-height: 1.2;
              }
              .address { 
                font-size: 9px; 
                margin: 3px 0 8px 0; 
                color: #333; 
                line-height: 1.3;
              }
              .title {
                font-size: 11px;
                font-weight: bold;
                letter-spacing: 0.5px;
                margin: 8px 0 2px 0;
              }
              .num { 
                font-size: 54px; 
                font-weight: 900; 
                margin: 5px 0; 
                line-height: 1;
              }
              .note { 
                font-size: 9px; 
                margin: 3px 0; 
                line-height: 1.2;
              }
              .datetime {
                font-size: 9px;
                margin: 8px 0 4px 0;
              }
              .footer { 
                font-size: 10px; 
                margin-top: 10px; 
                border-top: 1px dashed #000; 
                padding-top: 8px; 
                font-weight: bold;
                text-transform: uppercase;
              }
              hr { border-top: 1px dashed #000; border-bottom: none; margin: 6px 0; }
            </style>
          </head>
          <body>
            <div class="receipt-container">
              <h2>${settings.nama_instansi}</h2>
              <div class="address">${settings.alamat}</div>
              <hr/>
              <div class="title">NOMOR ANTRIAN ANDA</div>
              <div class="num">${no_antrian}</div>
              <div class="note">Silakan menunggu hingga nomor antrian Anda dipanggil.</div>
              <div class="note">Nomor ini hanya berlaku pada hari ini.</div>
              <hr/>
              <div class="datetime">${new Date().toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</div>
              <div class="datetime">Pukul: ${new Date().toLocaleTimeString('id-ID')}</div>
              <div class="footer">TERIMA KASIH</div>
            </div>
          </body>
        </html>
      `;
      try {
        const fully = (window as any).fully;
        if (fully && typeof fully.printHtml === 'function') {
          if (settings.printer_name) {
            fully.printHtml(printHtml, settings.printer_name);
          } else {
            fully.printHtml(printHtml);
          }
        } else {
          console.warn('Fully Kiosk Browser API not available, falling back to window.print()');
          triggerBrowserPrint(no_antrian);
        }
      } catch (err) {
        console.error('Error printing fully_kiosk:', err);
        setPrintError(true);
      }
    } else if (pType === 'webusb') {
      await triggerWebUsbPrint(no_antrian);
    } else {
      triggerBrowserPrint(no_antrian);
    }
  };

  const fetchNextNumber = async () => {
    try {
      const res = await fetch('/api/nomor/getAntrian');
      if (res.ok) {
        const text = await res.text();
        setNextNumber(text || '001');
      }
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    fetchNextNumber();
    const interval = setInterval(fetchNextNumber, 5000);
    return () => clearInterval(interval);
  }, []);

  const handleTakeQueue = async () => {
    if (printLoading) return;
    setPrintLoading(true);
    setPrintError(false);
    
    try {
      const res = await fetch('/api/nomor/insert', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ target: 'default' })
      });
      
      if (res.ok) {
        const json = await res.json();
        if (json.success) {
          setLastPrinted(json.no_antrian);
          setShowReceipt(true);
          fetchNextNumber();
          
          // Execute print immediately after button is clicked (no bell sound)
          triggerPrint(json.no_antrian);
        }
      }
    } catch (e) {
      console.error(e);
      alert('Koneksi server gagal. Tidak bisa mengambil antrian.');
    } finally {
      setPrintLoading(false);
    }
  };

  const autoCloseTimerRef = useRef<number | null>(null);

  useEffect(() => {
    if (showReceipt) {
      autoCloseTimerRef.current = window.setTimeout(() => setShowReceipt(false), 5000);
    }
    return () => {
      if (autoCloseTimerRef.current !== null) {
        window.clearTimeout(autoCloseTimerRef.current);
        autoCloseTimerRef.current = null;
      }
    };
  }, [showReceipt]);

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col justify-between relative overflow-hidden" style={{ backgroundColor: '#f3f4f6' }}>
      {/* Optional Background Hero Image */}
      {settings.hero_image && (
        <div 
          className="absolute inset-0 pointer-events-none"
          style={{
            backgroundImage: `url(/api/uploads/${settings.hero_image})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            opacity: settings.hero_opacity ?? 0.2,
            zIndex: 0
          }}
        />
      )}
      {/* Top Brand Banner */}
      <header className="py-6 px-8 text-white shadow-md flex items-center justify-between relative z-10" style={{ backgroundColor: 'var(--color-primary)' }}>
        <div className="flex items-center gap-4">
          <img 
            src={logoUrl} 
            alt="Logo" 
            className="h-14 w-auto object-contain bg-white/10 p-1.5 rounded-lg border border-white/20"
            onError={(e) => { 
              const target = e.target as HTMLImageElement;
              if (!target.src.endsWith('/favicon.png')) {
                target.src = '/favicon.png';
              } else {
                target.src = 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7';
              }
            }}
          />
          <div>
            <h1 className="text-xl md:text-2xl font-bold uppercase tracking-wide" style={{ color: 'var(--color-secondary)' }}>
              {settings.nama_instansi}
            </h1>
            <p className="text-xs opacity-80 max-w-xl truncate" style={{ color: 'var(--color-secondary)' }}>
              {settings.alamat}
            </p>
          </div>
        </div>
        <div className="text-right hidden md:block" style={{ color: 'var(--color-secondary)' }}>
          <div className="text-sm font-semibold flex items-center gap-1 justify-end">
            <Clock className="w-4 h-4" />
            <span>Kios Antrian Mandiri</span>
          </div>
          <p className="text-xs opacity-70">Silakan tekan tombol untuk mencetak tiket</p>
        </div>
      </header>

      {/* Main Body */}
      <main className="flex-1 max-w-4xl mx-auto w-full flex flex-col items-center justify-center p-6 gap-8 relative z-10">
        <div className="bg-white rounded-3xl shadow-xl border border-slate-200/60 p-8 w-full max-w-2xl text-center flex flex-col items-center gap-6 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-3" style={{ backgroundColor: 'var(--color-accent)' }} />
          
          <div className="p-4 bg-slate-50 border border-slate-100 rounded-full inline-block mt-4 text-slate-400">
            <Printer className="w-10 h-10 text-emerald-500 animate-pulse" />
          </div>

          <div>
            <h2 className="text-3xl font-black text-slate-800 tracking-tight">AMBIL NOMOR ANTRIAN</h2>
            <p className="text-slate-500 text-sm mt-1.5 max-w-md mx-auto">
              Silakan ambil tiket antrian pendaftaran pelayanan Anda.
            </p>
          </div>

          {/* Big display card showing the next number */}
          <div className="bg-slate-50 border border-slate-100 py-6 px-12 rounded-2xl w-full max-w-md">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-widest block mb-1">Nomor Antrian Berikutnya</span>
            <div className="text-6xl font-black tracking-tight" style={{ color: 'var(--color-accent)' }}>
              {nextNumber}
            </div>
            <p className="text-[10px] text-slate-400 mt-2">Disediakan otomatis oleh sistem pencatat</p>
          </div>

          {/* Trigger Button */}
          <button
            onClick={handleTakeQueue}
            disabled={printLoading}
            className="w-full max-w-md py-6 px-8 rounded-2xl text-xl font-bold tracking-wide shadow-lg flex items-center justify-center gap-3 transition-all duration-300 transform active:scale-95 disabled:opacity-50 hover:brightness-110 text-white cursor-pointer"
            style={{ backgroundColor: 'var(--color-accent)' }}
          >
            {printLoading ? (
              <>
                <RefreshCw className="w-6 h-6 animate-spin" />
                <span>Mencetak Tiket...</span>
              </>
            ) : (
              <>
                <Printer className="w-6 h-6" />
                <span>AMBIL NOMOR ANTRIAN</span>
              </>
            )}
          </button>

        </div>
      </main>

      {/* Ticket/Receipt simulation Modal */}
      {showReceipt && lastPrinted && (
        <div className="fixed inset-0 bg-slate-900/70 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white text-slate-800 w-full max-w-sm rounded-2xl shadow-2xl overflow-hidden border border-slate-200 animate-scale-up flex flex-col max-h-[90vh]">
            {/* Simulation visual bar */}
            <div className="bg-emerald-50 border-b border-emerald-100 px-4 py-3 flex items-center gap-2 text-xs font-semibold text-emerald-800">
              <Sparkles className="w-4 h-4 text-emerald-500 shrink-0" />
              <span>Tiket Antrian Anda Dicetak Otomatis!</span>
            </div>

            {/* Handle Print Error alert */}
            {printError && (
              <div className="mx-6 mt-4 bg-red-50 border border-red-200 p-4 rounded-xl flex items-start gap-2.5 text-left">
                <AlertTriangle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-xs font-bold text-red-800">Pencetakan Gagal</h4>
                  <p className="text-[10px] text-red-600 mt-0.5 leading-relaxed">
                    {settings.printer_type === 'webusb'
                      ? 'Printer USB tidak terhubung. Hubungkan printer di halaman Pengaturan.'
                      : 'Browser memblokir jendela popup cetak. Harap izinkan popup di peramban Anda untuk mencetak tiket secara langsung.'}
                  </p>
                  <button
                    onClick={() => triggerPrint(lastPrinted)}
                    className="mt-2 bg-red-600 hover:bg-red-700 text-white py-1.5 px-3 rounded-lg text-[10px] font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <Printer className="w-3.5 h-3.5" />
                    <span>Cetak Ulang Tiket</span>
                  </button>
                </div>
              </div>
            )}

            {/* Simulated Receipt (Scrollable) */}
            <div className="p-8 flex-1 overflow-y-auto bg-slate-50 border-b border-slate-100">
              <div className="bg-white border border-slate-200/80 p-6 rounded-lg shadow-sm font-mono text-xs text-slate-800 text-center relative flex flex-col items-center">
                {/* Thermal receipt jagged top border effect */}
                <div className="absolute top-0 left-0 right-0 h-1 flex justify-between overflow-hidden opacity-60">
                  {Array.from({ length: 40 }).map((_, i) => (
                    <div key={i} className="w-2.5 h-2.5 bg-slate-50 rotate-45 transform -translate-y-1.5 border-b border-r border-slate-200" />
                  ))}
                </div>

                {/* Receipt content */}
                <div className="mt-4 font-bold text-sm uppercase">{settings.nama_instansi}</div>
                <div className="text-[10px] text-slate-400 mt-1 max-w-[220px] leading-tight">{settings.alamat}</div>
                
                <div className="w-full border-t border-dashed border-slate-300 my-4" />
                
                <div className="font-semibold text-slate-500 uppercase tracking-wider text-[10px]">NOMOR ANTRIAN ANDA</div>
                <div className="text-5xl font-black my-4 text-slate-900">{lastPrinted}</div>
                
                <div className="text-[10px] text-slate-500 leading-relaxed max-w-[200px] mx-auto">
                  Silakan menunggu hingga nomor antrian Anda dipanggil. Nomor ini hanya berlaku pada hari ini.
                </div>

                <div className="w-full border-t border-dashed border-slate-300 my-4" />
                
                <div className="text-[10px] text-slate-400 flex flex-col gap-0.5">
                  <span>Waktu: {new Date().toLocaleTimeString('id-ID')}</span>
                  <span>Tanggal: {new Date().toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span>
                </div>

                <div className="w-full border-t border-dashed border-slate-300 my-4" />

                <div className="font-black tracking-widest text-[11px] text-slate-700">TERIMA KASIH</div>

                {/* Thermal receipt jagged bottom border effect */}
                <div className="absolute bottom-0 left-0 right-0 h-1 flex justify-between overflow-hidden opacity-60">
                  {Array.from({ length: 40 }).map((_, i) => (
                    <div key={i} className="w-2.5 h-2.5 bg-slate-50 rotate-45 transform translate-y-1.5 border-t border-l border-slate-200" />
                  ))}
                </div>
              </div>
            </div>

            {/* Print action bar */}
            <div className="p-4 bg-slate-100 border-t border-slate-200 flex items-center justify-center">
              <button
                onClick={() => setShowReceipt(false)}
                className="w-full bg-slate-200 hover:bg-slate-300 text-slate-700 py-2.5 px-4 rounded-xl text-xs font-bold transition-colors cursor-pointer text-center"
              >
                Tutup Layar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Footer copyright */}
      <footer className="py-4 px-8 text-center text-xs text-slate-400 bg-slate-50 border-t border-slate-200 relative z-10">
        {FOOTER_COPYRIGHT}
        
        {/* Subtle toggle button for navigation menu to prevent customer misclicks */}
        <button
          onClick={onToggleNav}
          className="absolute right-4 top-1/2 -translate-y-1/2 p-2 bg-slate-200/40 hover:bg-slate-200/90 text-slate-500 hover:text-slate-800 rounded-xl text-[10px] font-black transition-all cursor-pointer flex items-center gap-1 border border-slate-300/30 opacity-25 hover:opacity-100"
          title="Toggle Navigation Menu"
        >
          <Settings className="w-3.5 h-3.5 animate-spin-slow" />
          <span>{showNav ? "LOCK MENU" : "NAVIGASI"}</span>
        </button>
      </footer>
    </div>
  );
}

// ==========================================
// 3. OPERATOR / COUNTER VIEW (PANGGILAN)
// ==========================================
function CounterView({ settings, showNav, onToggleNav }: { settings: AppSettings, showNav: boolean, onToggleNav: () => void }) {
  const [selectedLoket, setSelectedLoket] = useState<string>('1');
  const [queues, setQueues] = useState<QueueItem[]>([]);
  const [stats, setStats] = useState<QueueStats>({ total: 0, sekarang: '-', selanjutnya: '-', sisa: 0 });
  const [filterMode, setFilterMode] = useState<'all' | 'waiting' | 'served'>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [resetConfirmOpen, setResetConfirmOpen] = useState<boolean>(false);
  const [actionLoading, setActionLoading] = useState<boolean>(false);

  useEffect(() => {
    const source = new EventSource('/api/sse/updates');
    source.onmessage = (e) => {
      try {
        const d = JSON.parse(e.data);
        setStats(d.stats);
        const list = Array.isArray(d.queues) ? d.queues : [];
        setQueues(list.filter((q: any) => q.id !== ''));
      } catch (err) {
        console.error('SSE parse error:', err);
      }
    };
    return () => source.close();
  }, []);

  const handleCall = async (noAntrian: string, queueId?: number) => {
    if (!noAntrian || noAntrian === '-' || actionLoading) return;
    setActionLoading(true);

    try {
      // 1. Register Call to Monitor
      await fetch('/api/panggilan/createPanggilan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ antrian: noAntrian, loket: selectedLoket })
      });

      // 2. If it's a specific queue item we called, update its status in DB to "served/calling" ('1')
      if (queueId) {
        await fetch('/api/panggilan/update', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id: queueId })
        });
      }
    } catch (e) {
      console.error(e);
    } finally {
      setActionLoading(false);
    }
  };

  const handleCallNext = async () => {
    if (stats.selanjutnya === '-' || actionLoading) return;
    
    // Find the queue object with this number
    const targetItem = queues.find(q => q.no_antrian === stats.selanjutnya && q.status === '0');
    if (targetItem) {
      await handleCall(targetItem.no_antrian, targetItem.id);
    } else {
      // Emergency fallback: call next string directly
      await handleCall(stats.selanjutnya);
    }
  };

  const handleResetDaily = async () => {
    setActionLoading(true);
    try {
      const res = await fetch('/api/panggilan/resetDaily', { method: 'POST' });
      if (res.ok) {
        setResetConfirmOpen(false);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setActionLoading(false);
    }
  };

  // Filter queues
  const filteredQueues = queues.filter(q => {
    // 1. Filter by status
    if (filterMode === 'waiting' && q.status !== '0') return false;
    if (filterMode === 'served' && q.status !== '1') return false;
    
    // 2. Filter by search query
    if (searchQuery) {
      return q.no_antrian.includes(searchQuery);
    }
    return true;
  });

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 flex flex-col justify-between">
      {/* Navbar header */}
      <header className="bg-white border-b border-slate-200/80 px-8 py-5 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-3">
          <div 
            className="p-2 rounded-xl border"
            style={{ 
              backgroundColor: `${settings.warna_accent || '#2563eb'}10`, 
              borderColor: `${settings.warna_accent || '#2563eb'}25`,
              color: settings.warna_accent || '#2563eb'
            }}
          >
            <UserCheck className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-lg font-extrabold tracking-wide text-slate-900 uppercase">{settings.nama_instansi}</h1>
            <p className="text-xs text-slate-500 font-medium">Panel Operator Panggilan Loket</p>
          </div>
        </div>
        
        {/* Loket selector */}
        <div className="flex items-center gap-3">
          <label className="text-xs font-bold text-slate-500 uppercase tracking-wider hidden md:inline">Loket Aktif:</label>
          <select
            value={selectedLoket}
            onChange={(e) => setSelectedLoket(e.target.value)}
            className="bg-white border border-slate-200 text-slate-800 rounded-xl px-4 py-2 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all cursor-pointer shadow-sm"
          >
            {settings.list_loket && settings.list_loket.length > 0 ? (
              settings.list_loket.map((l) => (
                <option key={l.no_loket} value={l.no_loket}>
                  {l.nama_loket}
                </option>
              ))
            ) : (
              <>
                <option value="1">LOKET 1</option>
                <option value="2">LOKET 2</option>
                <option value="3">LOKET 3</option>
              </>
            )}
          </select>
        </div>
      </header>

      {/* Main dashboard content */}
      <main className="flex-1 max-w-7xl mx-auto w-full p-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Side: Statistics & Primary Action */}
        <div className="lg:col-span-1 flex flex-col gap-6 animate-fade-in">
          {/* Main Action Call Card */}
          <div className="bg-white border border-slate-200/90 rounded-2xl p-6 flex flex-col justify-between shadow-md relative overflow-hidden">
            <div 
              className="absolute top-0 right-0 w-32 h-32 rounded-bl-full pointer-events-none opacity-5"
              style={{ backgroundColor: settings.warna_accent || '#2563eb' }}
            />
            
            <div>
              <span className="text-[10px] font-black tracking-widest block uppercase mb-1" style={{ color: settings.warna_accent || '#2563eb' }}>Panggilan Antrian Utama</span>
              <h2 className="text-xl font-extrabold text-slate-950">PANGGIL SEKARANG</h2>
              <p className="text-slate-500 text-xs mt-1 leading-relaxed">
                Panggil nomor antrian berikutnya secara otomatis dari urutan pendaftaran hari ini.
              </p>
            </div>

            <div className="my-8 text-center bg-slate-50 border border-slate-200/60 py-6 rounded-xl relative">
              <span className="text-[10px] text-slate-400 block font-bold uppercase tracking-widest mb-1">Antrian Selanjutnya</span>
              <div className="text-5xl font-black tracking-tight font-mono" style={{ color: settings.warna_accent || '#2563eb' }}>{stats.selanjutnya}</div>
            </div>

            <div className="flex flex-col gap-3">
              <button
                onClick={handleCallNext}
                disabled={stats.selanjutnya === '-' || actionLoading}
                style={{ 
                  backgroundColor: stats.selanjutnya === '-' ? undefined : (settings.warna_accent || '#2563eb'),
                  color: stats.selanjutnya === '-' ? undefined : '#ffffff'
                }}
                className="w-full disabled:bg-slate-100 disabled:text-slate-400 font-extrabold py-4 px-6 rounded-xl flex items-center justify-center gap-2 transition-all shadow-md disabled:shadow-none cursor-pointer text-sm tracking-wide hover:opacity-90 active:scale-[0.99]"
              >
                <Volume2 className="w-5 h-5" />
                <span>PANGGIL ANTRIAN BERIKUTNYA</span>
              </button>

              {/* Call input box (allows calling specific manual numbers) */}
              <div className="flex gap-2 mt-2">
                <input
                  type="text"
                  placeholder="Ketik No (misal: 005)"
                  maxLength={3}
                  className="bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 flex-1 shadow-sm font-semibold"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      const num = (e.target as HTMLInputElement).value.trim();
                      if (num) {
                        const targetItem = queues.find(q => q.no_antrian === String(num).padStart(3, '0'));
                        handleCall(String(num).padStart(3, '0'), targetItem?.id);
                        (e.target as HTMLInputElement).value = '';
                      }
                    }
                  }}
                />
                <button
                  onClick={(e) => {
                    const inputEl = e.currentTarget.previousSibling as HTMLInputElement;
                    const num = inputEl.value.trim();
                    if (num) {
                      const targetItem = queues.find(q => q.no_antrian === String(num).padStart(3, '0'));
                      handleCall(String(num).padStart(3, '0'), targetItem?.id);
                      inputEl.value = '';
                    }
                  }}
                  className="bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold px-4 rounded-xl text-xs cursor-pointer border border-slate-200 shadow-sm transition-colors"
                >
                  Panggil Manual
                </button>
              </div>
            </div>
          </div>

          {/* Stats Widgets */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-white border border-slate-200/90 p-5 rounded-2xl flex flex-col justify-between shadow-md">
              <span className="text-[10px] font-bold text-slate-400 tracking-wider uppercase block">Total Antrian</span>
              <div className="text-3xl font-black text-slate-900 mt-2">{stats.total}</div>
              <span className="text-[9px] text-slate-500 mt-1 block font-medium">Tiket terambil hari ini</span>
            </div>

            <div className="bg-white border border-slate-200/90 p-5 rounded-2xl flex flex-col justify-between shadow-md">
              <span className="text-[10px] font-bold text-slate-400 tracking-wider uppercase block">Sisa Menunggu</span>
              <div className="text-3xl font-black mt-2" style={{ color: settings.warna_accent || '#2563eb' }}>{stats.sisa}</div>
              <span className="text-[9px] text-slate-500 mt-1 block font-medium">Tiket belum dilayani</span>
            </div>
          </div>

          {/* Reset Action */}
          <div className="bg-white border border-slate-200/90 p-5 rounded-2xl flex items-center justify-between shadow-md">
            <div className="flex flex-col">
              <h4 className="text-xs font-extrabold text-slate-900 uppercase tracking-wide">Reset Antrian Harian</h4>
              <p className="text-[10px] text-slate-500 mt-0.5 font-medium">Menghapus semua daftar antrian untuk esok hari</p>
            </div>
            <button
              onClick={() => setResetConfirmOpen(true)}
              className="p-3 bg-red-50 hover:bg-red-100 text-red-600 rounded-xl border border-red-200 transition-colors cursor-pointer shadow-sm"
              title="Reset Database Antrian"
            >
              <RotateCcw className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Right Side (2 Cols): Live Queue List */}
        <div className="lg:col-span-2 bg-white border border-slate-200/90 rounded-2xl p-6 flex flex-col shadow-md overflow-hidden max-h-[80vh] animate-fade-in">
          {/* Header toolbar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-5 mb-5">
            <div>
              <h3 className="text-lg font-extrabold text-slate-950">DAFTAR ANTRIAN HARI INI</h3>
              <p className="text-xs text-slate-500 font-medium">Total {queues.length} data antrian aktif hari ini</p>
            </div>

            {/* Filter Buttons */}
            <div className="flex bg-slate-50 border border-slate-200/70 p-1 rounded-xl text-xs font-semibold shrink-0">
              <button
                onClick={() => setFilterMode('all')}
                style={filterMode === 'all' ? { backgroundColor: settings.warna_accent || '#2563eb', color: '#ffffff' } : {}}
                className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${filterMode === 'all' ? 'font-bold shadow-sm' : 'text-slate-500 hover:text-slate-800'}`}
              >
                Semua ({queues.length})
              </button>
              <button
                onClick={() => setFilterMode('waiting')}
                style={filterMode === 'waiting' ? { backgroundColor: settings.warna_accent || '#2563eb', color: '#ffffff' } : {}}
                className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${filterMode === 'waiting' ? 'font-bold shadow-sm' : 'text-slate-500 hover:text-slate-800'}`}
              >
                Menunggu ({queues.filter(q => q.status === '0').length})
              </button>
              <button
                onClick={() => setFilterMode('served')}
                style={filterMode === 'served' ? { backgroundColor: settings.warna_accent || '#2563eb', color: '#ffffff' } : {}}
                className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${filterMode === 'served' ? 'font-bold shadow-sm' : 'text-slate-500 hover:text-slate-800'}`}
              >
                Selesai ({queues.filter(q => q.status === '1').length})
              </button>
            </div>
          </div>

          {/* Search bar */}
          <div className="mb-4">
            <input
              type="text"
              placeholder="Cari nomor antrian (misal: 002)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 focus:border-blue-500 rounded-xl px-4 py-3 text-xs text-slate-800 focus:outline-none transition-colors placeholder-slate-400 font-semibold shadow-sm"
            />
          </div>

          {/* List Content */}
          <div className="flex-1 overflow-y-auto pr-1">
            {filteredQueues.length === 0 ? (
              <div className="py-12 text-center text-slate-400 flex flex-col items-center justify-center gap-2">
                <UserCheck className="w-8 h-8 text-slate-300 animate-pulse" />
                <p className="text-sm font-semibold text-slate-500">Tidak ada antrian yang cocok.</p>
                <p className="text-[10px] text-slate-400 font-medium">Silakan ambil nomor antrian baru di menu Kios.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {filteredQueues.map((q) => (
                  <div
                    key={q.id}
                    className="bg-slate-50/50 border border-slate-100 hover:border-slate-200/80 px-5 py-4 rounded-xl flex items-center justify-between gap-4 transition-all hover:bg-slate-50 shadow-sm"
                  >
                    <div className="flex items-center gap-4">
                      {/* Badge representation */}
                      <div className="text-xl font-black bg-white border border-slate-200 text-slate-900 w-14 h-14 rounded-xl flex items-center justify-center tracking-tight shadow-sm font-mono">
                        {q.no_antrian}
                      </div>

                      <div className="flex flex-col gap-0.5">
                        <div className="flex items-center gap-2">
                          <span className={`h-2 w-2 rounded-full ${q.status === '1' ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500 animate-pulse'}`} />
                          <span className="text-xs font-extrabold text-slate-700 uppercase tracking-wide">
                            {q.status === '1' ? 'SUDAH DIPANGGIL' : 'MENUNGGU LOKET'}
                          </span>
                        </div>
                        {q.updated_date && (
                          <span className="text-[9px] text-slate-400 font-medium">
                            Dilayani: {q.updated_date.substring(11, 19)} (Local)
                          </span>
                        )}
                        <span className="text-[9px] text-slate-400 font-medium">ID: #{q.id} • Tgl: {q.tanggal}</span>
                      </div>
                    </div>

                    {/* Operational controls */}
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleCall(q.no_antrian, q.id)}
                        disabled={actionLoading}
                        style={{ 
                          backgroundColor: settings.warna_accent || '#2563eb',
                          color: '#ffffff'
                        }}
                        className="hover:opacity-90 active:scale-95 disabled:bg-slate-200 disabled:text-slate-400 font-extrabold px-3 py-2 rounded-lg text-xs flex items-center gap-1 transition-all cursor-pointer shadow-sm"
                        title={q.status === '1' ? 'Panggil Ulang / Recall' : 'Panggil Antrian'}
                      >
                        <Volume2 className="w-3.5 h-3.5" />
                        <span>{q.status === '1' ? 'Panggil Ulang' : 'Panggil'}</span>
                      </button>

                      {q.status === '0' && (
                        <button
                          onClick={async () => {
                            setActionLoading(true);
                            await fetch('/api/panggilan/update', {
                              method: 'POST',
                              headers: { 'Content-Type': 'application/json' },
                              body: JSON.stringify({ id: q.id })
                            });
                            setActionLoading(false);
                          }}
                          disabled={actionLoading}
                          className="bg-emerald-50 hover:bg-emerald-100 disabled:opacity-50 text-emerald-600 font-extrabold px-3 py-2 rounded-lg text-xs flex items-center gap-1 border border-emerald-200 transition-all cursor-pointer shadow-sm"
                        >
                          Selesai
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Safety Confirm Dialog */}
      {resetConfirmOpen && (
        <div className="fixed inset-0 bg-slate-950/40 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white border border-slate-200 text-slate-800 max-w-md w-full rounded-2xl p-6 shadow-2xl flex flex-col gap-4 animate-scale-up">
            <div className="p-3 bg-red-50 text-red-600 border border-red-100 rounded-xl w-fit">
              <AlertTriangle className="w-6 h-6" />
            </div>

            <div>
              <h3 className="text-lg font-black text-slate-900">RESET ANTRIAN HARIAN?</h3>
              <p className="text-slate-500 text-xs mt-1.5 leading-relaxed font-medium">
                Tindakan ini akan menghapus dan mengarsipkan seluruh antrian hari ini ({queues.length} tiket). Monitor display akan dikosongkan dan nomor akan diurut dari <strong className="text-slate-950">001</strong> kembali. Anda yakin?
              </p>
            </div>

            <div className="flex gap-3 mt-2">
              <button
                onClick={handleResetDaily}
                disabled={actionLoading}
                className="flex-1 bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white font-bold py-2.5 rounded-xl text-xs transition-colors cursor-pointer shadow-sm"
              >
                Ya, Reset Antrian
              </button>
              <button
                onClick={() => setResetConfirmOpen(false)}
                className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold py-2.5 rounded-xl text-xs transition-colors cursor-pointer border border-slate-200 shadow-sm"
              >
                Batalkan
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Footer info */}
      <footer className="py-4 px-8 text-center text-xs text-slate-400 bg-white border-t border-slate-200/80 relative">
        {FOOTER_COPYRIGHT}
        
        {/* Subtle toggle button for navigation menu to prevent customer misclicks */}
        <button
          onClick={onToggleNav}
          className="absolute right-4 top-1/2 -translate-y-1/2 p-2 bg-slate-200/40 hover:bg-slate-200/90 text-slate-500 hover:text-slate-800 rounded-xl text-[10px] font-black transition-all cursor-pointer flex items-center gap-1 border border-slate-300/30 opacity-25 hover:opacity-100"
          title="Toggle Navigation Menu"
        >
          <Settings className="w-3.5 h-3.5 animate-spin-slow" />
          <span>{showNav ? "LOCK MENU" : "NAVIGASI"}</span>
        </button>
      </footer>
    </div>
  );
}

// ==========================================
// 4. MONITOR VIEW (PUBLIC TELEVISION DISPLAY)
// ==========================================
function MonitorView({ settings, showNav, onToggleNav }: { settings: AppSettings, showNav: boolean, onToggleNav: () => void }) {
  const [servingNum, setServingNum] = useState<string>('-');
  const [servingLoket, setServingLoket] = useState<string>('-');
  const [stats, setStats] = useState<QueueStats>({ total: 0, sekarang: '-', selanjutnya: '-', sisa: 0 });
  const [waitingQueues, setWaitingQueues] = useState<QueueItem[]>([]);
  const [timeStr, setTimeStr] = useState<string>('');
  const [isPlayingVoice, setIsPlayingVoice] = useState<boolean>(false);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const queuePanggilRef = useRef<PanggilanItem[]>([]);
  const isPlayLoopRef = useRef<boolean>(false);
  const wasPlayingRef = useRef<boolean>(false);
  const speechPermittedRef = useRef(false);
  const [speechPermitted, setSpeechPermitted] = useState(false);
  const [speechInitError, setSpeechInitError] = useState(false);

  // Time ticker
  useEffect(() => {
    const updateJam = () => {
      const d = new Date();
      const h = String(d.getHours()).padStart(2, '0');
      const m = String(d.getMinutes()).padStart(2, '0');
      const s = String(d.getSeconds()).padStart(2, '0');
      setTimeStr(`${h}:${m}:${s}`);
    };
    updateJam();
    const interval = setInterval(updateJam, 1000);
    return () => clearInterval(interval);
  }, []);

  // SSE real-time updates
  useEffect(() => {
    const source = new EventSource('/api/sse/updates');
    source.onmessage = (e) => {
      try {
        const d = JSON.parse(e.data);
        setStats(d.stats);
        const list = Array.isArray(d.queues) ? d.queues : [];
        setWaitingQueues(list.filter((q: QueueItem) => q.status === '0' && q.id !== undefined));
        if (!isPlayLoopRef.current) {
          setServingNum(d.stats.sekarang || '-');
        }
        const calls = Array.isArray(d.calls) ? d.calls : [];
        const now = Date.now();
        calls.forEach((element: PanggilanItem) => {
          if (element.created_at && (now - element.created_at) > 60000) {
            fetch('/api/monitor/panggilan/delete', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id: element.id }) }).catch(() => {});
            return;
          }
          const exists = queuePanggilRef.current.some(c => c.id === element.id);
          if (!exists) {
            queuePanggilRef.current.push(element);
          }
        });
        if (queuePanggilRef.current.length > 0 && !isPlayLoopRef.current) {
          triggerCallingLoop();
        }
      } catch (err) {
        console.error('SSE parse error:', err);
      }
    };
    return () => source.close();
  }, []);

  const triggerCallingLoop = () => {
    if (queuePanggilRef.current.length === 0 || isPlayLoopRef.current) return;
    if (!speechPermittedRef.current) return;
    
    isPlayLoopRef.current = true;
    setIsPlayingVoice(true);

    pauseYouTube();

    const callItem = queuePanggilRef.current[0];

    setServingNum(callItem.antrian);
    setServingLoket(callItem.loket);

    const bell = document.getElementById('tingtung') as HTMLAudioElement;
    if (bell) {
      bell.currentTime = 0;
      const playPromise = bell.play();
      if (playPromise !== undefined) {
        playPromise.catch(console.warn);
      }
    }

    const durasi_bell = (bell && bell.duration && !isNaN(bell.duration) ? bell.duration : 1.5) * 1000;

    setTimeout(() => {
      if (typeof responsiveVoice !== 'undefined') {
        responsiveVoice.speak(
          "Nomor Antrian, " + callItem.antrian + ", menuju, loket, " + callItem.loket,
          "Indonesian Female",
          {
            rate: 0.9,
            pitch: 1,
            volume: 1,
            onend: function() {
              queuePanggilRef.current.shift();
              isPlayLoopRef.current = false;
              setIsPlayingVoice(false);
              delete_panggilan(callItem.id);
              playYouTube();
              if (queuePanggilRef.current.length > 0) {
                triggerCallingLoop();
              }
            }
          }
        );
      } else {
        console.warn('responsiveVoice not loaded');
        queuePanggilRef.current.shift();
        isPlayLoopRef.current = false;
        setIsPlayingVoice(false);
        delete_panggilan(callItem.id);
        playYouTube();
        if (queuePanggilRef.current.length > 0) {
          triggerCallingLoop();
        }
      }
    }, durasi_bell);
  };

  const delete_panggilan = async (id: number) => {
    try {
      await fetch('/api/monitor/panggilan/delete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id })
      });
    } catch (e) {
      console.warn('delete_panggilan failed:', e);
    }
  };

  const pauseYouTube = () => {
    const player = document.getElementById('youtube-player') as HTMLIFrameElement;
    if (player && player.contentWindow) {
      wasPlayingRef.current = true;
      player.contentWindow.postMessage('{"event":"command","func":"pauseVideo","args":""}', '*');
    }
  };

  const playYouTube = () => {
    if (!wasPlayingRef.current) return;
    wasPlayingRef.current = false;
    const player = document.getElementById('youtube-player') as HTMLIFrameElement;
    if (player && player.contentWindow) {
      player.contentWindow.postMessage('{"event":"command","func":"playVideo","args":""}', '*');
    }
  };

  const initSpeech = () => {
    if (!audioCtxRef.current) {
      audioCtxRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    if (audioCtxRef.current.state === 'suspended') {
      audioCtxRef.current.resume().catch(() => {});
    }
    speechSynthesis.cancel();
    const dummy = new SpeechSynthesisUtterance(' ');
    speechSynthesis.speak(dummy);
    if (typeof responsiveVoice !== 'undefined') {
      responsiveVoice.speak('Sistem suara siap', 'Indonesian Female', {
        rate: 0.9,
        pitch: 1,
        volume: 0,
        onend: () => {
          speechPermittedRef.current = true;
          setSpeechPermitted(true);
        },
        onerror: () => {
          setSpeechInitError(true);
        }
      });
    } else {
      console.warn('responsiveVoice not loaded');
      speechPermittedRef.current = true;
      setSpeechPermitted(true);
    }
  };

  useEffect(() => {
    if (!audioCtxRef.current) {
      audioCtxRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
  }, []);

  const logoUrl = settings.logo ? `/api/uploads/${settings.logo}` : '/favicon.png';
  const showVideo = settings.youtube_id && settings.youtube_id !== '-' && settings.youtube_id.trim() !== '';

  return (
    <div 
      className="min-h-screen flex flex-col justify-between overflow-hidden select-none relative"
      style={{ backgroundColor: settings.warna_background || '#f1f5f9' }}
    >
      {/* Optional Background Hero Image */}
      {settings.hero_image && (
        <div 
          className="absolute inset-0 pointer-events-none"
          style={{
            backgroundImage: `url(/api/uploads/${settings.hero_image})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            opacity: settings.hero_opacity ?? 0.2,
            zIndex: 0
          }}
        />
      )}
      {/* Top Banner Header */}
      <header 
        className="px-8 py-5 flex items-center justify-between border-b shadow-md relative z-10"
        style={{ 
          backgroundColor: settings.warna_primary || '#1e293b',
          borderColor: 'rgba(0, 0, 0, 0.05)'
        }}
      >
        <div className="flex items-center gap-4">
          <img 
            src={logoUrl} 
            alt="Logo" 
            className="h-16 w-auto object-contain bg-white/10 p-2 rounded-xl border border-white/20"
            onError={(e) => { 
              const target = e.target as HTMLImageElement;
              if (!target.src.endsWith('/favicon.png')) {
                target.src = '/favicon.png';
              } else {
                target.src = 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7';
              }
            }}
          />
          <div>
            <h1 className="text-xl md:text-2xl font-black uppercase tracking-wide" style={{ color: settings.warna_secondary || '#ffffff' }}>
              {settings.nama_instansi}
            </h1>
            <p className="text-xs opacity-80 max-w-xl truncate" style={{ color: settings.warna_secondary || '#ffffff' }}>
              {settings.alamat}
            </p>
          </div>
        </div>

        {/* Real-time Dates */}
        <div className="text-right flex items-center gap-6" style={{ color: settings.warna_secondary || '#ffffff' }}>
          <div className="flex items-center gap-2">
            <Calendar className="w-5 h-5 opacity-75" />
            <span className="text-sm font-bold">
              {new Date().toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
            </span>
          </div>
          <div className="flex items-center gap-2 bg-white/10 px-4 py-2 rounded-xl border border-white/20">
            <Clock className="w-5 h-5 text-amber-300" />
            <span className="font-mono text-lg font-black tracking-widest">{timeStr || '--:--:--'}</span>
          </div>
        </div>
      </header>

      {/* Main Grid: YouTube Video + Numbers */}
      <main className="flex-1 p-6 max-w-[1800px] w-full mx-auto grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch relative z-10">
        
        {/* Left Col: YouTube Video Background */}
        {showVideo && (
          <div className="lg:col-span-7 flex flex-col justify-center animate-fade-in">
            <div className="relative w-full aspect-video rounded-3xl overflow-hidden shadow-xl bg-black border border-slate-200">
              <iframe
                id="youtube-player"
                width="100%"
                height="100%"
                src={`https://www.youtube.com/embed/${settings.youtube_id}?autoplay=1&mute=${isPlayingVoice ? 1 : 0}&loop=1&playlist=${settings.youtube_id}&controls=0&showinfo=0&rel=0&modestbranding=1&enablejsapi=1`}
                title="Public Display Video Player"
                frameBorder="0"
                allow="autoplay; encrypted-media; gyroscope"
                className="absolute inset-0 w-full h-full"
              />
              
              {/* Soft overlay when calling is running */}
              {isPlayingVoice && (
                <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-[2px] transition-all flex items-center justify-center">
                  <div className="bg-white/95 border border-blue-500/30 px-6 py-3.5 rounded-full text-sm font-bold text-blue-600 flex items-center gap-2 shadow-xl animate-pulse">
                    <Volume2 className="w-5 h-5" />
                    <span>MENGUMUMKAN ANTRIAN...</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Right Col: Big Queue Ticket Display (full width if no video is present) */}
        <div className={`flex flex-col gap-6 ${showVideo ? 'lg:col-span-5' : 'lg:col-span-12 max-w-4xl mx-auto w-full'} animate-fade-in`}>
          {/* Adaptive Color Calculations for Professional Contrast */}
          {(() => {
            const isDarkBg = settings.warna_background && (
              settings.warna_background.toLowerCase().startsWith('#0') || 
              settings.warna_background.toLowerCase().startsWith('#1') || 
              settings.warna_background.toLowerCase().startsWith('#2')
            );
            const cardBg = isDarkBg ? 'bg-slate-900/95 border-slate-800 text-slate-100 shadow-2xl' : 'bg-white border-slate-200/85 text-slate-800 shadow-md';
            const textPrimary = isDarkBg ? 'text-white' : 'text-slate-900';
            const textSecondary = isDarkBg ? 'text-slate-400' : 'text-slate-500';
            const innerBoxBg = isDarkBg ? 'bg-slate-950/60 border-slate-800' : 'bg-slate-50 border-slate-200/50';
            const badgeBg = isDarkBg ? 'bg-slate-800/80 hover:bg-slate-700/80 border-slate-700 text-slate-200' : 'bg-slate-50 hover:bg-slate-100 border-slate-200/70 text-slate-800';

            return (
              <>
                {/* Main Calling Box */}
                <div 
                  className={`flex-1 rounded-3xl p-8 flex flex-col justify-between relative overflow-hidden text-center min-h-[350px] border ${cardBg}`}
                  style={{ 
                    borderColor: isPlayingVoice ? (settings.warna_accent || '#2563eb') : undefined,
                    boxShadow: isPlayingVoice ? `0 0 40px ${settings.warna_accent || 'rgba(37, 99, 235, 0.2)'}` : undefined
                  }}
                >
                  {/* Top title bar */}
                  <div>
                    <span className="text-xs font-bold tracking-widest block uppercase mb-1" style={{ color: settings.warna_accent || '#2563eb' }}>Panggilan Aktif Saat Ini</span>
                    <h2 className={`text-2xl font-black ${textPrimary}`}>NOMOR ANTRIAN SEKARANG</h2>
                  </div>

                  {/* Glowing Main Number */}
                  <div className="my-6">
                    <div 
                      className={`text-8xl md:text-9xl font-black tracking-tighter ${isPlayingVoice ? 'scale-110' : ''} transition-all duration-300`}
                      style={{ 
                        color: isPlayingVoice ? (settings.warna_accent || '#3b82f6') : (settings.warna_accent || '#2563eb')
                      }}
                    >
                      {servingNum}
                    </div>
                  </div>

                  {/* Destined Counter Counter Box */}
                  <div className={`py-4 px-6 rounded-2xl max-w-sm mx-auto w-full border ${innerBoxBg}`}>
                    <span className={`text-[10px] block font-bold uppercase tracking-widest mb-0.5 ${textSecondary}`}>Silakan Menuju ke</span>
                    <div className="text-xl font-extrabold" style={{ color: settings.warna_accent || '#2563eb' }}>
                      {servingLoket && servingLoket !== '-' ? `LOKET ${servingLoket}` : '-'}
                    </div>
                  </div>
                </div>

                {/* Sub Stats Tickers */}
                <div className="grid grid-cols-2 gap-6 shrink-0">
                  {/* Box 1 */}
                  <div className={`p-5 rounded-2xl text-center border ${cardBg}`}>
                    <span className={`text-[10px] font-bold uppercase tracking-widest ${textSecondary}`}>Antrian Selanjutnya</span>
                    <div className={`text-3xl font-black mt-1.5 ${textPrimary}`}>{stats.selanjutnya}</div>
                  </div>
                  
                  {/* Box 2 */}
                  <div className={`p-5 rounded-2xl text-center border ${cardBg}`}>
                    <span className={`text-[10px] font-bold uppercase tracking-widest ${textSecondary}`}>Total Antrian</span>
                    <div className={`text-3xl font-black mt-1.5 ${textPrimary}`}>{stats.total}</div>
                  </div>
                </div>

                {/* Daftar Nomor Tunggu (Waiting Queues) */}
                <div className={`p-6 rounded-2xl border flex flex-col gap-3 min-h-[160px] ${cardBg}`}>
                  <div className="flex items-center gap-2 border-b border-slate-100/10 pb-2">
                    <div className="w-2.5 h-2.5 rounded-full bg-amber-500 animate-pulse" />
                    <span className={`text-[11px] font-bold uppercase tracking-wider ${textSecondary}`}>Daftar Nomor Tunggu ({waitingQueues.length})</span>
                  </div>
                  <div className="flex-1 overflow-y-auto max-h-[160px] pr-1">
                    {waitingQueues.length === 0 ? (
                      <div className={`h-full flex items-center justify-center text-xs py-4 font-medium italic ${textSecondary}`}>
                        Tidak ada nomor antrian menunggu.
                      </div>
                    ) : (
                      <div className="flex flex-wrap gap-2 items-center justify-start py-1">
                        {waitingQueues.map((q) => (
                          <div 
                            key={q.id} 
                            className={`px-3 py-2 rounded-xl font-mono text-xs font-black shadow-sm transition-all hover:scale-105 flex items-center gap-1.5 border ${badgeBg}`}
                          >
                            <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: settings.warna_accent || '#2563eb' }} />
                            <span>{q.no_antrian}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </>
            );
          })()}
        </div>
      </main>

      {/* Bottom Running Ticker */}
      <footer 
        className="border-t select-none shadow-md overflow-hidden flex flex-col justify-center relative z-10"
        style={{ 
          backgroundColor: settings.warna_primary || '#1e293b',
          borderColor: 'rgba(0, 0, 0, 0.05)',
          color: settings.warna_secondary || '#ffffff'
        }}
      >
        <div className="w-full overflow-hidden whitespace-nowrap py-3.5 relative flex items-center bg-black/20">
          <marquee behavior="scroll" direction="left" className="font-bold text-lg md:text-xl uppercase">
            *** {settings.running_text} ***
          </marquee>
        </div>
        <div className="bg-black/40 py-1 text-center text-[10px] opacity-40 relative">
          {FOOTER_COPYRIGHT}
          
          {/* Subtle toggle button for navigation menu to prevent customer misclicks */}
          <button
            onClick={onToggleNav}
            className="absolute right-4 top-1/2 -translate-y-1/2 p-2 bg-white/10 hover:bg-white/20 text-white/60 hover:text-white rounded-xl text-[10px] font-black transition-all cursor-pointer flex items-center gap-1 border border-white/10 opacity-25 hover:opacity-100"
            title="Toggle Navigation Menu"
          >
            <Settings className="w-3.5 h-3.5 animate-spin-slow" />
            <span>{showNav ? "LOCK MENU" : "NAVIGASI"}</span>
          </button>
        </div>
      </footer>

      {!speechPermitted && (
        <div className="fixed bottom-20 left-1/2 -translate-x-1/2 z-50 flex items-center gap-3 bg-white/95 border border-slate-200 shadow-lg rounded-full px-5 py-3 text-sm">
          <Volume2 className="w-4 h-4 text-blue-500 shrink-0" />
          <span className="text-slate-600 text-xs">Suara monitor belum aktif</span>
          <button onClick={initSpeech} className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-3 py-1 rounded-full text-[10px] transition-colors cursor-pointer">Aktifkan</button>
        </div>
      )}

      <audio id="tingtung" src="/assets/audio/tingtung.mp3" preload="metadata" />
    </div>
  );
}

// ==========================================
// WebUSB Pairing Component (used in SettingsView)
// ==========================================
function isDarkColor(hex: string | undefined): boolean {
  if (!hex) return false;
  const c = hex.replace('#', '');
  const full = c.length === 3 ? c.split('').map((ch) => ch + ch).join('') : c;
  if (!/^[0-9a-fA-F]{6}$/.test(full)) return false;
  const r = parseInt(full.slice(0, 2), 16);
  const g = parseInt(full.slice(2, 4), 16);
  const b = parseInt(full.slice(4, 6), 16);
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  return luminance < 0.55;
}

function WebUsbPairing({ dark }: { dark: boolean }) {
  const [webusbConnected, setWebusbConnected] = useState(false);
  const [webusbName, setWebusbName] = useState('');
  const devRef = useRef<USBDevice | null>(null);

  useEffect(() => {
    const saved = localStorage.getItem('webusb_pairing');
    if (!saved) return;
    try {
      const pair = JSON.parse(saved);
      navigator.usb.getDevices().then(devices => {
        const match = devices.find(d => d.vendorId === pair.vendorId && d.productId === pair.productId);
        if (match) {
          setWebusbConnected(true);
          setWebusbName(match.productName || `USB Device (${pair.vendorId}:${pair.productId})`);
        }
      }).catch(() => {});
    } catch {}
  }, []);

  const handleConnect = async () => {
    try {
      const device = await navigator.usb.requestDevice({ filters: [] });
      await device.open();
      await device.selectConfiguration(1);
      await device.claimInterface(0);
      devRef.current = device;
      localStorage.setItem('webusb_pairing', JSON.stringify({ vendorId: device.vendorId, productId: device.productId }));
      setWebusbConnected(true);
      setWebusbName(device.productName || `USB Device (${device.vendorId}:${device.productId})`);
    } catch (e) {
      console.error('WebUSB pair failed:', e);
    }
  };

  const handleDisconnect = () => {
    if (devRef.current) {
      devRef.current.close().catch(() => {});
      devRef.current = null;
    }
    localStorage.removeItem('webusb_pairing');
    setWebusbConnected(false);
    setWebusbName('');
  };

  return (
    <div className="flex flex-col gap-1.5">
      <label className={`text-xs font-bold uppercase tracking-wide ${dark ? 'text-slate-400' : 'text-slate-500'}`}>Printer USB (WebUSB)</label>
      {webusbConnected ? (
        <div className={`flex items-center gap-2 border rounded-xl px-3 py-2.5 text-xs ${dark ? 'bg-slate-900/70 border-emerald-700/60 text-emerald-400' : 'bg-white border-emerald-300 text-emerald-600'}`}>
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shrink-0" />
          <span className="flex-1 truncate">{webusbName}</span>
          <button type="button" onClick={handleDisconnect} className="text-red-400 hover:text-red-300 font-bold uppercase text-[10px] cursor-pointer shrink-0">Ganti Printer</button>
        </div>
      ) : (
        <button
          type="button"
          onClick={handleConnect}
          className={`border border-dashed rounded-xl px-3 py-2.5 text-xs transition-all cursor-pointer flex items-center gap-2 ${dark ? 'bg-slate-900/70 border-slate-700 hover:border-[var(--color-accent)] text-slate-400 hover:text-[var(--color-accent)]' : 'bg-white border-slate-300 hover:border-[var(--color-accent)] text-slate-500 hover:text-[var(--color-accent)]'}`}
        >
          <Usb className="w-4 h-4" />
          <span>Hubungkan Printer USB</span>
        </button>
      )}
    </div>
  );
}

// ==========================================
// 5. SETTINGS VIEW (SYSTEM MANAGER)
// ==========================================
function SettingsView({ settings, onUpdate }: { settings: AppSettings, onUpdate: () => void }) {
  const [instansi, setInstansi] = useState<string>(settings.nama_instansi);
  const [alamat, setAlamat] = useState<string>(settings.alamat);
  const [telpon, setTelpon] = useState<string>(settings.telpon);
  const [email, setEmail] = useState<string>(settings.email);
  const [runningText, setRunningText] = useState<string>(settings.running_text);
  const [youtubeId, setYoutubeId] = useState<string>(settings.youtube_id);
  const [listLoket, setListLoket] = useState<any[]>(settings.list_loket || []);
  const [logoName, setLogoName] = useState<string>(settings.logo || '');
  const [heroImage, setHeroImage] = useState<string>(settings.hero_image || '');
  const [heroOpacity, setHeroOpacity] = useState<number>(settings.hero_opacity ?? 0.2);
  
  // Custom theme colors state
  const [primaryColor, setPrimaryColor] = useState<string>(settings.warna_primary || '#1e293b');
  const [secondaryColor, setSecondaryColor] = useState<string>(settings.warna_secondary || '#ffffff');
  const [accentColor, setAccentColor] = useState<string>(settings.warna_accent || '#2563eb');
  const [bgColor, setBgColor] = useState<string>(settings.warna_background || '#f1f5f9');
  const [homeBgColor, setHomeBgColor] = useState<string>(settings.warna_home_bg || '#f8fafc');
  const [homeTextColor, setHomeTextColor] = useState<string>(settings.warna_home_text || '#0f172a');
  
  // Printer configuration state
  const [printerType, setPrinterType] = useState<'browser' | 'fully_kiosk' | 'windows_local' | 'webusb'>(settings.printer_type || 'browser');
  const [printerName, setPrinterName] = useState<string>(settings.printer_name || '');
  const [printerPaperWidth, setPrinterPaperWidth] = useState<'58' | '80'>(settings.printer_paper_width || '80');

  // Synchronize state when settings object changes (e.g. from server)
  useEffect(() => {
    setPrinterType(settings.printer_type || 'browser');
    setPrinterName(settings.printer_name || '');
    setPrinterPaperWidth(settings.printer_paper_width || '80');
    setHeroImage(settings.hero_image || '');
    setHeroOpacity(settings.hero_opacity ?? 0.2);
  }, [settings]);

  const [newLoketNum, setNewLoketNum] = useState<string>('');
  const [newLoketName, setNewLoketName] = useState<string>('');
  
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [uploadStatus, setUploadStatus] = useState<string | null>(null);
  const [heroUploadStatus, setHeroUploadStatus] = useState<string | null>(null);

  // Handle logo drag & drop or select upload
  const handleLogoUpload = async (file: File) => {
    if (!file.type.startsWith('image/') && !file.name.endsWith('.svg') && !file.type.includes('svg')) {
      alert('File yang diunggah harus berformat gambar!');
      return;
    }
    setUploadStatus('Mengunggah...');

    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = async () => {
      const base64Str = reader.result as string;
      try {
        const res = await fetch('/api/settings/logo', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ filename: file.name, base64: base64Str })
        });
        
        if (res.ok) {
          const json = await res.json();
          if (json.success) {
            setLogoName(json.filename);
            setUploadStatus('Selesai!');
            onUpdate();
          }
        }
      } catch (e) {
        console.error(e);
        setUploadStatus('Gagal mengunggah.');
      }
    };
  };

  // Handle hero bg drag & drop or select upload
  const handleHeroUpload = async (file: File) => {
    if (!file.type.startsWith('image/') && !file.name.endsWith('.svg') && !file.type.includes('svg')) {
      alert('File yang diunggah harus berformat gambar!');
      return;
    }
    setHeroUploadStatus('Mengunggah...');

    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = async () => {
      const base64Str = reader.result as string;
      try {
        const res = await fetch('/api/settings/hero', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ filename: file.name, base64: base64Str })
        });
        
        if (res.ok) {
          const json = await res.json();
          if (json.success) {
            setHeroImage(json.filename);
            setHeroUploadStatus('Selesai!');
            onUpdate();
          }
        }
      } catch (e) {
        console.error(e);
        setHeroUploadStatus('Gagal mengunggah.');
      }
    };
  };

  const handleRemoveHero = () => {
    setHeroImage('');
    setHeroUploadStatus(null);
  };

  const handleRemoveLogo = () => {
    setLogoName('');
    setUploadStatus(null);
  };

  const handleSaveSettings = async (e: FormEvent) => {
    e.preventDefault();
    setIsSaving(true);

    const payload: AppSettings = {
      nama_instansi: instansi,
      alamat,
      telpon,
      email,
      running_text: runningText,
      youtube_id: youtubeId,
      list_loket: listLoket,
      logo: logoName,
      warna_primary: primaryColor,
      warna_secondary: secondaryColor,
      warna_accent: accentColor,
      warna_background: bgColor,
      warna_text: '#ffffff',
      warna_home_bg: homeBgColor,
      warna_home_text: homeTextColor,
      printer_type: printerType,
      printer_name: printerName,
      printer_paper_width: printerPaperWidth,
      hero_image: heroImage,
      hero_opacity: heroOpacity
    };

    try {
      const res = await fetch('/api/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (res.ok) {
        onUpdate();
        alert('Pengaturan berhasil disimpan!');
      }
    } catch (err) {
      console.error(err);
      alert('Gagal menyimpan ke server.');
    } finally {
      setIsSaving(false);
    }
  };

  const addLoketItem = () => {
    if (!newLoketNum || !newLoketName) return;
    const exists = listLoket.some(l => l.no_loket === newLoketNum);
    if (exists) {
      alert('Nomor loket ini sudah ada!');
      return;
    }
    setListLoket([...listLoket, { no_loket: newLoketNum, nama_loket: newLoketName }]);
    setNewLoketNum('');
    setNewLoketName('');
  };

  const deleteLoketItem = (no: string) => {
    setListLoket(listLoket.filter(l => l.no_loket !== no));
  };

  const logoUrl = logoName ? `/api/uploads/${logoName}` : '/favicon.png';

  // Adaptive theme styling (light/dark) driven by the selected theme
  const isDark = isDarkColor(settings.warna_background);
  const accent = settings.warna_accent || '#2563eb';
  const surfaceCard = isDark ? 'bg-slate-900/80 border-slate-800' : 'bg-white border-slate-200';
  const surfaceSub = isDark ? 'bg-slate-900/60 border-slate-800/80' : 'bg-slate-50 border-slate-200/80';
  const inputClass = isDark
    ? 'bg-slate-900/70 border-slate-700/80 text-slate-200 placeholder-slate-500'
    : 'bg-white border-slate-300 text-slate-800 placeholder-slate-400';
  const inputInner = isDark
    ? 'bg-slate-950/80 border-slate-800 text-slate-100 placeholder-slate-600'
    : 'bg-white border-slate-300 text-slate-800 placeholder-slate-400';
  const headingText = isDark ? 'text-slate-300' : 'text-slate-700';
  const mutedText = isDark ? 'text-slate-400' : 'text-slate-500';
  const subtleText = isDark ? 'text-slate-500' : 'text-slate-400';
  const divider = isDark ? 'border-slate-800' : 'border-slate-200';
  const bodyText = isDark ? 'text-slate-100' : 'text-slate-800';

  return (
    <div className={`min-h-screen flex flex-col justify-between transition-colors duration-300 ${bodyText}`} style={{ backgroundColor: 'var(--color-bg)' }}>
      <header className="px-8 py-5 flex items-center justify-between border-b" style={{ backgroundColor: 'var(--color-primary)', borderColor: 'rgba(0, 0, 0, 0.05)' }}>
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl border" style={{ backgroundColor: `${accent}1a`, color: accent, borderColor: `${accent}30` }}>
            <Settings className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-lg font-extrabold tracking-wide uppercase" style={{ color: 'var(--color-secondary)' }}>{settings.nama_instansi}</h1>
            <p className="text-xs opacity-70" style={{ color: 'var(--color-secondary)' }}>Pengaturan & Kustomisasi Branding Kios</p>
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-6xl mx-auto w-full p-6">
        <form onSubmit={handleSaveSettings} className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
          
          {/* Column 1: Core details & Ticker & Video */}
          <div className={`md:col-span-2 rounded-2xl p-6 flex flex-col gap-5 shadow-xl ${surfaceCard}`}>
            <h3 className={`text-sm font-black ${headingText} uppercase tracking-wider pb-3 border-b ${divider}`}>
              Profil Instansi & Media
            </h3>

            {/* Nama Instansi */}
            <div className="flex flex-col gap-1.5">
              <label className={`text-xs font-bold ${mutedText} uppercase tracking-wide`}>Nama Instansi</label>
              <input
                type="text"
                required
                value={instansi}
                onChange={(e) => setInstansi(e.target.value)}
                className={`${inputClass} rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[var(--color-accent)] transition-colors`}
                placeholder="Masukkan nama instansi / perusahaan"
              />
            </div>

            {/* Alamat */}
            <div className="flex flex-col gap-1.5">
              <label className={`text-xs font-bold ${mutedText} uppercase tracking-wide`}>Alamat Kontak</label>
              <textarea
                required
                value={alamat}
                onChange={(e) => setAlamat(e.target.value)}
                rows={3}
                className={`${inputClass} rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[var(--color-accent)] transition-colors`}
                placeholder="Masukkan alamat lengkap instansi"
              />
            </div>

            {/* Telp & Email */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="flex flex-col gap-1.5">
                <label className={`text-xs font-bold ${mutedText} uppercase tracking-wide`}>Nomor Telepon</label>
                <input
                  type="text"
                  required
                  value={telpon}
                  onChange={(e) => setTelpon(e.target.value)}
                  className={`${inputClass} rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[var(--color-accent)] transition-colors`}
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className={`text-xs font-bold ${mutedText} uppercase tracking-wide`}>Alamat Email</label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className={`${inputClass} rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[var(--color-accent)] transition-colors`}
                />
              </div>
            </div>

            {/* Running Text */}
            <div className="flex flex-col gap-1.5">
              <label className={`text-xs font-bold ${mutedText} uppercase tracking-wide`}>Running Text Ticker</label>
              <input
                type="text"
                required
                value={runningText}
                onChange={(e) => setRunningText(e.target.value)}
                className={`${inputClass} rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[var(--color-accent)] transition-colors`}
                placeholder="Pesan pengumuman yang berjalan di bawah monitor display"
              />
            </div>

            {/* YouTube ID */}
            <div className="flex flex-col gap-1.5">
              <div className="flex items-center justify-between">
                <label className={`text-xs font-bold ${mutedText} uppercase tracking-wide`}>YouTube Video ID</label>
                <span className={`text-[10px] ${subtleText}`}>Tulis <code className={`${inputClass} px-1 py-0.5 rounded`}>-</code> untuk mematikan video</span>
              </div>
              <input
                type="text"
                required
                value={youtubeId}
                onChange={(e) => setYoutubeId(e.target.value)}
                className={`${inputClass} rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[var(--color-accent)] transition-colors`}
                placeholder="ID di ujung tautan youtube (misal: Srr5BCta8UY)"
              />
            </div>

            {/* Konfigurasi Mesin Cetak Tiket (Printer) */}
            <div className={`${surfaceSub} p-5 rounded-2xl flex flex-col gap-4`}>
              <div className={`flex items-center gap-2 border-b ${divider} pb-2`}>
                <Printer className="w-4 h-4" style={{ color: accent }} />
                <h4 className={`text-xs font-black ${headingText} uppercase tracking-wider`}>Konfigurasi Printer Tiket Kios</h4>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Metode Pencetakan */}
                <div className="flex flex-col gap-1.5">
                  <label className={`text-xs font-bold ${mutedText} uppercase tracking-wide`}>Metode Pencetakan</label>
                  <select
                    value={printerType}
                    onChange={(e) => setPrinterType(e.target.value as any)}
                    className={`${inputInner} rounded-xl px-3 py-2.5 text-xs focus:outline-none focus:border-[var(--color-accent)] transition-colors`}
                  >
                    <option value="browser">Dialog Cetak Browser (window.print)</option>
                    <option value="windows_local">Windows Local Direct (Mencetak otomatis via Server Lokal)</option>
                    <option value="fully_kiosk">Fully Kiosk Browser (Mencetak otomatis di Android Kiosk)</option>
                    <option value="webusb">USB Direct Android (WebUSB - Cetak langsung tanpa watermark)</option>
                  </select>
                </div>

                {printerType === 'webusb' && <WebUsbPairing dark={isDark} />}

                {/* Nama Printer / Lokasi */}
                <div className="flex flex-col gap-1.5">
                  <label className={`text-xs font-bold ${mutedText} uppercase tracking-wide`}>Nama / Driver Printer</label>
                  <input
                    type="text"
                    value={printerName}
                    onChange={(e) => setPrinterName(e.target.value)}
                    className={`${inputInner} rounded-xl px-3 py-2.5 text-xs focus:outline-none focus:border-[var(--color-accent)] transition-colors`}
                    placeholder="Kosongkan untuk printer default (opsional)"
                    disabled={printerType === 'browser'}
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className={`text-xs font-bold ${mutedText} uppercase tracking-wide`}>Lebar Kertas Thermal</label>
                  <select
                    value={printerPaperWidth}
                    onChange={(e) => setPrinterPaperWidth(e.target.value as '58' | '80')}
                    className={`${inputInner} rounded-xl px-3 py-2.5 text-xs focus:outline-none focus:border-[var(--color-accent)] transition-colors`}
                  >
                    <option value="58">58mm</option>
                    <option value="80">80mm</option>
                  </select>
                </div>
              </div>

              {/* Deskripsi bantuan interaktif */}
              <div className={`text-[10px] ${subtleText} p-3 rounded-xl border leading-relaxed ${isDark ? 'bg-slate-950/40 border-slate-800/60' : 'bg-slate-100/60 border-slate-200/60'}`}>
                {printerType === 'browser' && (
                  <span><strong>Info:</strong> Menggunakan jendela cetak browser standar. Cocok untuk pengujian cepat. Membutuhkan konfirmasi klik pada dialog browser.</span>
                )}
                {printerType === 'windows_local' && (
                  <span><strong>Info Windows:</strong> Tiket akan dicetak secara otomatis tanpa dialog konfirmasi langsung dari server lokal ke printer Windows. Jika nama printer dikosongkan, cetakan dikirim langsung ke printer default sistem Windows. Jika diisi, pastikan printer telah di-share dengan nama tersebut (tab Sharing di Printer Properties).</span>
                )}
                {printerType === 'fully_kiosk' && (
                  <span><strong>Info Android:</strong> Gunakan opsi ini jika aplikasi dijalankan di tablet Android via peramban Fully Kiosk Browser yang terhubung dengan printer thermal (Bluetooth/USB). Memanfaatkan fungsi otomatis <code>fully.printHtml()</code>.</span>
                )}
                {printerType === 'webusb' && (
                  <span><strong>Info USB Direct:</strong> Menggunakan WebUSB untuk mengirim data ESC/POS langsung ke printer thermal. Pasangkan printer USB di atas, lalu buka layar Kios — printer akan terhubung otomatis.</span>
                )}
              </div>
            </div>

            {/* Counter Loket Management */}
            <div className="flex flex-col gap-3 mt-2">
              <label className={`text-xs font-bold ${mutedText} uppercase tracking-wide block`}>Kelola Loket Pelayanan</label>
              
              {/* Input row */}
              <div className={`flex gap-2 p-2 rounded-xl ${surfaceSub}`}>
                <input
                  type="text"
                  placeholder="No (misal: 1)"
                  value={newLoketNum}
                  onChange={(e) => setNewLoketNum(e.target.value)}
                  className={`${inputInner} rounded-lg px-3 py-2 text-xs focus:outline-none w-24`}
                />
                <input
                  type="text"
                  placeholder="Nama Loket (misal: LOKET ADMISI 1)"
                  value={newLoketName}
                  onChange={(e) => setNewLoketName(e.target.value)}
                  className={`${inputInner} rounded-lg px-3 py-2 text-xs focus:outline-none flex-1`}
                />
                <button
                  type="button"
                  onClick={addLoketItem}
                  style={{ backgroundColor: 'var(--color-accent)' }}
                  className="text-white font-bold rounded-lg px-3 flex items-center justify-center gap-1 text-xs cursor-pointer hover:brightness-110 transition-all"
                >
                  <Plus className="w-4 h-4" />
                  <span>Tambah</span>
                </button>
              </div>

              {/* Table list */}
              <div className={`rounded-xl overflow-hidden max-h-[220px] overflow-y-auto border ${isDark ? 'bg-slate-900/50 border-slate-800' : 'bg-white border-slate-200'}`}>
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className={`border-b font-bold ${mutedText} ${isDark ? 'bg-slate-900 border-slate-800' : 'bg-slate-50 border-slate-200'}`}>
                      <th className="py-2 px-4">No Loket</th>
                      <th className="py-2 px-4">Nama Counter</th>
                      <th className="py-2 px-4 text-center">Tindakan</th>
                    </tr>
                  </thead>
                  <tbody>
                    {listLoket.length === 0 ? (
                      <tr>
                        <td colSpan={3} className="py-6 text-center text-slate-600">Belum ada loket ditambahkan.</td>
                      </tr>
                    ) : (
                      listLoket.map((l, i) => (
                        <tr key={i} className={`border-b ${isDark ? 'border-slate-800/60 hover:bg-slate-900/40' : 'border-slate-200/60 hover:bg-slate-50'}`}>
                          <td className="py-2.5 px-4 font-mono font-bold" style={{ color: accent }}>{l.no_loket}</td>
                          <td className={`py-2.5 px-4 uppercase font-semibold ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>{l.nama_loket}</td>
                          <td className="py-2.5 px-4 text-center">
                            <button
                              type="button"
                              onClick={() => deleteLoketItem(l.no_loket)}
                              className="text-red-400 hover:text-red-500 p-1.5 cursor-pointer inline-flex"
                              title="Hapus Loket"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Column 2: Logo upload & Dynamic styling & Save button */}
          <div className="flex flex-col gap-6">
            {/* Logo image upload container */}
            <div className={`rounded-2xl p-6 shadow-xl flex flex-col items-center text-center gap-4 ${surfaceCard}`}>
              <h4 className={`text-xs font-bold ${headingText} uppercase tracking-widest block w-full text-left pb-2 border-b ${divider} flex justify-between items-center`}>
                <span>Logo Instansi</span>
                {logoName && (
                  <button 
                    type="button"
                    onClick={handleRemoveLogo}
                    className="text-[10px] text-red-400 hover:text-red-500 font-bold uppercase tracking-wider bg-red-500/10 px-2 py-0.5 rounded cursor-pointer"
                  >
                    Hapus
                  </button>
                )}
              </h4>

              <div className={`relative border p-3 rounded-2xl ${isDark ? 'border-slate-800 bg-slate-900' : 'border-slate-200 bg-slate-50'}`}>
                <img
                  src={logoUrl}
                  alt="Instansi Logo"
                  className="h-28 w-28 object-contain"
                  onError={(e) => { 
                    const target = e.target as HTMLImageElement;
                    if (!target.src.endsWith('/favicon.png')) {
                      target.src = '/favicon.png';
                    } else {
                      target.src = 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7';
                    }
                  }}
                />
              </div>

              {/* Upload field */}
              <div className="w-full">
                <label className={`border-2 border-dashed rounded-xl p-4 flex flex-col items-center justify-center gap-2 cursor-pointer transition-all ${isDark ? 'border-slate-800 hover:border-[var(--color-accent)] hover:bg-slate-900/40' : 'border-slate-300 hover:border-[var(--color-accent)] hover:bg-slate-100'}`}>
                  <Upload className="w-6 h-6 animate-bounce" style={{ color: accent }} />
                  <span className="text-xs font-bold">Pilih / Seret Logo Baru</span>
                  <span className={`text-[9px] ${subtleText}`}>Format PNG/JPG/WEBP/SVG</span>
                  <input
                    type="file"
                    accept="image/*,.svg"
                    className="hidden"
                    onChange={(e) => {
                      if (e.target.files && e.target.files[0]) {
                        handleLogoUpload(e.target.files[0]);
                      }
                    }}
                  />
                </label>
                {uploadStatus && (
                  <p className="text-[10px] mt-2 font-semibold" style={{ color: accent }}>{uploadStatus}</p>
                )}
              </div>
            </div>

            {/* Hero Image upload container */}
            <div className={`rounded-2xl p-6 shadow-xl flex flex-col items-center text-center gap-4 ${surfaceCard}`}>
              <h4 className={`text-xs font-bold ${headingText} uppercase tracking-widest block w-full text-left pb-2 border-b ${divider} flex justify-between items-center`}>
                <span>Hero Image Tampilan</span>
                {heroImage && (
                  <button 
                    type="button"
                    onClick={handleRemoveHero}
                    className="text-[10px] text-red-400 hover:text-red-500 font-bold uppercase tracking-wider bg-red-500/10 px-2 py-0.5 rounded cursor-pointer"
                  >
                    Hapus
                  </button>
                )}
              </h4>

              <div className={`relative border p-3 rounded-2xl w-full flex justify-center ${isDark ? 'border-slate-800 bg-slate-900' : 'border-slate-200 bg-slate-50'}`}>
                {heroImage ? (
                  <img
                    src={`/api/uploads/${heroImage}`}
                    alt="Hero Background"
                    className="h-28 w-full object-cover rounded-lg"
                    onError={(e) => { 
                      const target = e.target as HTMLImageElement;
                      if (!target.src.endsWith('/favicon.png')) {
                        target.src = '/favicon.png';
                      } else {
                        target.src = 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7';
                      }
                    }}
                  />
                ) : (
                  <div className={`h-28 w-full rounded-lg flex items-center justify-center text-xs italic ${isDark ? 'bg-slate-950 text-slate-600' : 'bg-slate-100 text-slate-500'}`}>
                    Belum ada background hero image
                  </div>
                )}
              </div>

              {/* Upload field */}
              <div className="w-full">
                <label className={`border-2 border-dashed rounded-xl p-4 flex flex-col items-center justify-center gap-2 cursor-pointer transition-all ${isDark ? 'border-slate-800 hover:border-[var(--color-accent)] hover:bg-slate-900/40' : 'border-slate-300 hover:border-[var(--color-accent)] hover:bg-slate-100'}`}>
                  <Upload className="w-6 h-6 animate-bounce" style={{ color: accent }} />
                  <span className="text-xs font-bold">Pilih / Seret Background Baru</span>
                  <span className={`text-[9px] ${subtleText}`}>Format PNG/JPG/WEBP/SVG</span>
                  <input
                    type="file"
                    accept="image/*,.svg"
                    className="hidden"
                    onChange={(e) => {
                      if (e.target.files && e.target.files[0]) {
                        handleHeroUpload(e.target.files[0]);
                      }
                    }}
                  />
                </label>
                {heroUploadStatus && (
                  <p className="text-[10px] mt-2 font-semibold" style={{ color: accent }}>{heroUploadStatus}</p>
                )}
              </div>

              {/* Hero opacity control */}
              <div className={`w-full flex flex-col gap-2 text-left mt-2 border-t ${divider} pt-4`}>
                <div className="flex justify-between items-center">
                  <label className={`text-[10px] font-bold ${mutedText} uppercase tracking-wide`}>Transparansi / Opacity Hero</label>
                  <span className="text-[11px] font-mono font-bold" style={{ color: accent }}>{Math.round(heroOpacity * 100)}%</span>
                </div>
                <input
                  type="range"
                  min="0.05"
                  max="1.0"
                  step="0.05"
                  value={heroOpacity}
                  onChange={(e) => setHeroOpacity(parseFloat(e.target.value))}
                  className={`w-full h-1.5 rounded-lg appearance-none cursor-pointer accent-[var(--color-accent)] ${isDark ? 'bg-slate-800' : 'bg-slate-300'}`}
                />
              </div>
            </div>

            {/* Custom Theme Color Picker */}
            <div className={`rounded-2xl p-6 shadow-xl flex flex-col gap-4 ${surfaceCard}`}>
              <h4 className={`text-xs font-bold ${headingText} uppercase tracking-widest block w-full text-left pb-2 border-b ${divider}`}>
                Warna Tema Tampilan
              </h4>

              <div className="grid grid-cols-2 gap-4">
                {/* Primary */}
                <div className="flex flex-col gap-1.5">
                  <label className={`text-[10px] font-bold ${mutedText} uppercase tracking-wide`}>Warna Header</label>
                  <div className={`flex gap-2 items-center p-1.5 rounded-lg border ${isDark ? 'bg-slate-900 border-slate-800' : 'bg-slate-100 border-slate-200'}`}>
                    <input
                      type="color"
                      value={primaryColor}
                      onChange={(e) => setPrimaryColor(e.target.value)}
                      className="w-8 h-8 rounded border-0 bg-transparent cursor-pointer shrink-0"
                    />
                    <span className={`font-mono text-[10px] ${subtleText}`}>{primaryColor}</span>
                  </div>
                </div>

                {/* Secondary */}
                <div className="flex flex-col gap-1.5">
                  <label className={`text-[10px] font-bold ${mutedText} uppercase tracking-wide`}>Warna Font Header</label>
                  <div className={`flex gap-2 items-center p-1.5 rounded-lg border ${isDark ? 'bg-slate-900 border-slate-800' : 'bg-slate-100 border-slate-200'}`}>
                    <input
                      type="color"
                      value={secondaryColor}
                      onChange={(e) => setSecondaryColor(e.target.value)}
                      className="w-8 h-8 rounded border-0 bg-transparent cursor-pointer shrink-0"
                    />
                    <span className={`font-mono text-[10px] ${subtleText}`}>{secondaryColor}</span>
                  </div>
                </div>

                {/* Accent */}
                <div className="flex flex-col gap-1.5">
                  <label className={`text-[10px] font-bold ${mutedText} uppercase tracking-wide`}>Warna Tombol</label>
                  <div className={`flex gap-2 items-center p-1.5 rounded-lg border ${isDark ? 'bg-slate-900 border-slate-800' : 'bg-slate-100 border-slate-200'}`}>
                    <input
                      type="color"
                      value={accentColor}
                      onChange={(e) => setAccentColor(e.target.value)}
                      className="w-8 h-8 rounded border-0 bg-transparent cursor-pointer shrink-0"
                    />
                    <span className={`font-mono text-[10px] ${subtleText}`}>{accentColor}</span>
                  </div>
                </div>

                {/* Background */}
                <div className="flex flex-col gap-1.5">
                  <label className={`text-[10px] font-bold ${mutedText} uppercase tracking-wide`}>Background Monitor</label>
                  <div className={`flex gap-2 items-center p-1.5 rounded-lg border ${isDark ? 'bg-slate-900 border-slate-800' : 'bg-slate-100 border-slate-200'}`}>
                    <input
                      type="color"
                      value={bgColor}
                      onChange={(e) => setBgColor(e.target.value)}
                      className="w-8 h-8 rounded border-0 bg-transparent cursor-pointer shrink-0"
                    />
                    <span className={`font-mono text-[10px] ${subtleText}`}>{bgColor}</span>
                  </div>
                </div>

                {/* Home BG */}
                <div className="flex flex-col gap-1.5">
                  <label className={`text-[10px] font-bold ${mutedText} uppercase tracking-wide`}>Background Home</label>
                  <div className={`flex gap-2 items-center p-1.5 rounded-lg border ${isDark ? 'bg-slate-900 border-slate-800' : 'bg-slate-100 border-slate-200'}`}>
                    <input
                      type="color"
                      value={homeBgColor}
                      onChange={(e) => setHomeBgColor(e.target.value)}
                      className="w-8 h-8 rounded border-0 bg-transparent cursor-pointer shrink-0"
                    />
                    <span className={`font-mono text-[10px] ${subtleText}`}>{homeBgColor}</span>
                  </div>
                </div>

                {/* Home Text */}
                <div className="flex flex-col gap-1.5">
                  <label className={`text-[10px] font-bold ${mutedText} uppercase tracking-wide`}>Warna Teks Home</label>
                  <div className={`flex gap-2 items-center p-1.5 rounded-lg border ${isDark ? 'bg-slate-900 border-slate-800' : 'bg-slate-100 border-slate-200'}`}>
                    <input
                      type="color"
                      value={homeTextColor}
                      onChange={(e) => setHomeTextColor(e.target.value)}
                      className="w-8 h-8 rounded border-0 bg-transparent cursor-pointer shrink-0"
                    />
                    <span className={`font-mono text-[10px] ${subtleText}`}>{homeTextColor}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Submit Action */}
            <button
              type="submit"
              disabled={isSaving}
              style={{ backgroundColor: 'var(--color-accent)' }}
              className="w-full text-white font-black py-4 px-6 rounded-2xl flex items-center justify-center gap-2 transition-all shadow-lg disabled:opacity-50 cursor-pointer text-sm uppercase tracking-wider hover:brightness-110"
            >
              {isSaving ? (
                <>
                  <RefreshCw className="w-5 h-5 animate-spin" />
                  <span>Menyimpan...</span>
                </>
              ) : (
                <>
                  <Settings className="w-5 h-5" />
                  <span>SIMPAN PENGATURAN</span>
                </>
              )}
            </button>
          </div>
          
        </form>

        {/* Web Style Guide & Design Consistency System */}
        <div className={`mt-8 rounded-2xl p-6 shadow-xl flex flex-col gap-5 ${surfaceCard}`}>
          <div className={`flex items-center gap-2.5 border-b ${divider} pb-3`}>
            <Sparkles className="w-5 h-5 animate-pulse" style={{ color: accent }} />
            <div>
              <h3 className={`text-sm font-black ${isDark ? 'text-slate-200' : 'text-slate-800'} uppercase tracking-wider`}>
                Theme Style Selection
              </h3>
              <p className={`text-[10px] ${mutedText} mt-0.5`}>
                Gunakan panduan preset warna di bawah ini untuk memastikan keselarasan desain visual di seluruh halaman aplikasi (Home, Kiosk, Operator, Monitor).
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-stretch">
            {/* 1. Quick Presets */}
            <div className={`p-4 rounded-xl border flex flex-col justify-between ${isDark ? 'bg-slate-900/40 border-slate-800' : 'bg-slate-100/60 border-slate-200'}`}>
              <div>
                <h4 className={`text-xs font-bold ${headingText} uppercase tracking-wide mb-1`}>1-Click Presets Harmonik</h4>
                <p className={`text-[10px] ${mutedText} mb-3 leading-relaxed`}>
                  Pilih preset industri di bawah ini untuk menerapkan skema warna yang diuji secara profesional dan konsisten secara instan.
                </p>
              </div>

              <div className="space-y-2.5">
                {[
                  {
                    name: 'Klinik / Rumah Sakit (Slate Blue)',
                    desc: 'Elegan, bersih & tenang',
                    primary: '#1e293b',
                    secondary: '#ffffff',
                    accent: '#2563eb',
                    bg: '#f1f5f9',
                    homeBg: '#f8fafc',
                    homeText: '#0f172a'
                  },
                  {
                    name: 'Bank / Koperasi (Classic Emerald)',
                    desc: 'Profesional, terpercaya & stabil',
                    primary: '#064e3b',
                    secondary: '#ffffff',
                    accent: '#059669',
                    bg: '#ecfdf5',
                    homeBg: '#f0fdf4',
                    homeText: '#065f46'
                  },
                  {
                    name: 'Layanan Publik (Deep Purple)',
                    desc: 'Modern, ramah & energetik',
                    primary: '#3b0764',
                    secondary: '#ffffff',
                    accent: '#8b5cf6',
                    bg: '#f5f3ff',
                    homeBg: '#faf5ff',
                    homeText: '#4c1d95'
                  },
                  {
                    name: 'Premium Lounge (Midnight Cosmic)',
                    desc: 'Branding eksklusif bertema gelap',
                    primary: '#030712',
                    secondary: '#f3f4f6',
                    accent: '#ec4899',
                    bg: '#0f172a',
                    homeBg: '#111827',
                    homeText: '#f9fafb'
                  }
                ].map((p, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => {
                      setPrimaryColor(p.primary);
                      setSecondaryColor(p.secondary);
                      setAccentColor(p.accent);
                      setBgColor(p.bg);
                      setHomeBgColor(p.homeBg);
                      setHomeTextColor(p.homeText);
                    }}
                    className={`w-full text-left p-2.5 border rounded-lg transition-all cursor-pointer flex justify-between items-center group ${isDark ? 'bg-slate-950 hover:bg-slate-900 border-slate-800 hover:border-slate-700/80' : 'bg-white hover:bg-slate-50 border-slate-200 hover:border-slate-300'}`}
                  >
                    <div>
                      <div className={`text-[10px] font-bold ${isDark ? 'text-slate-300' : 'text-slate-700'} group-hover:text-[var(--color-accent)] transition-colors`}>{p.name}</div>
                      <div className={`text-[9px] ${subtleText} mt-0.5`}>{p.desc}</div>
                    </div>
                    {/* Tiny Color Swatches */}
                    <div className="flex gap-1">
                      <div className="w-2.5 h-2.5 rounded-full border border-white/10" style={{ backgroundColor: p.primary }} title="Header" />
                      <div className="w-2.5 h-2.5 rounded-full border border-white/10" style={{ backgroundColor: p.accent }} title="Accent" />
                      <div className="w-2.5 h-2.5 rounded-full border border-white/10" style={{ backgroundColor: p.bg }} title="Monitor BG" />
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* 3. Live Style Preview */}
            <div className={`p-4 rounded-xl border flex flex-col justify-between ${isDark ? 'bg-slate-900/40 border-slate-800' : 'bg-slate-100/60 border-slate-200'}`}>
              <div>
                <h4 className={`text-xs font-bold ${headingText} uppercase tracking-wide mb-1`}>Live Palette Preview</h4>
                <p className={`text-[10px] ${mutedText} mb-3 leading-relaxed`}>
                  Pratinjau visual palet warna yang Anda pilih saat ini sebelum menyimpannya ke database.
                </p>
              </div>

              <div className="space-y-3">
                {/* Simulated Header block */}
                <div className="rounded-lg p-2.5 flex items-center justify-between border text-[10px] font-bold" style={{ backgroundColor: primaryColor, color: secondaryColor, borderColor: 'rgba(255,255,255,0.1)' }}>
                  <span className="truncate max-w-[120px]">{instansi || 'NAMA INSTANSI'}</span>
                  <div className="w-2 h-2 rounded-full" style={{ backgroundColor: accentColor }} />
                </div>

                {/* Simulated Button block */}
                <div className="rounded-lg p-2.5 text-center text-[10px] font-bold text-white shadow truncate" style={{ backgroundColor: accentColor }}>
                  AMBIL ANTRIAN (TOMBOL UTAMA)
                </div>

                {/* Simulated Monitor Background block */}
                <div className="rounded-lg p-2.5 border text-center text-[10px]" style={{ backgroundColor: bgColor, borderColor: 'rgba(0,0,0,0.08)' }}>
                  <span className="text-[9px] text-slate-500 font-bold uppercase tracking-wider block">Monitor Background Preview</span>
                  <div className="text-lg font-black font-mono mt-1" style={{ color: accentColor }}>001</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer info */}
      <footer className={`py-4 px-8 text-center text-xs ${mutedText} border-t mt-12 ${isDark ? 'bg-slate-950/80 border-slate-800/60' : 'bg-white/70 border-slate-200'}`}>
        {FOOTER_COPYRIGHT}
      </footer>
    </div>
  );
}
