<div align="center">
  <img src="assets/favicon.png" alt="Niscaya Logo" width="80" height="80" />
  <h1 align="center">Sistem Antrian Niscaya</h1>
  <p align="center">
    Aplikasi manajemen antrian berbasis web modern untuk instansi, klinik, bank, dan layanan publik.
    <br />
    <strong>Docker · React · Express · TypeScript</strong>
  </p>
</div>

---

## Tentang Aplikasi

Sistem Antrian Niscaya adalah aplikasi manajemen antrian digital yang dirancang untuk menggantikan sistem antrian kertas/conventional. Aplikasi ini menyediakan empat panel utama yang terintegrasi penuh:

- **Kios Mandiri** — Pengambilan nomor antrian secara otomatis dengan cetak tiket
- **Panel Operator** — Panggilan nomor antrian per loket dengan kontrol penuh
- **Monitor Display** — Tampilan TV publik dengan nomor antrian, video, running text, dan suara panggilan
- **Pengaturan** — Konfigurasi branding, warna, loket, printer, dan media

## Fitur Utama

| Fitur | Deskripsi |
|-------|-----------|
| 🖨️ **Cetak Tiket** | Cetak tiket antrian otomatis via browser, Windows Local, atau Fully Kiosk |
| 🔊 **Panggilan Suara** | Announcement otomatis dengan suara Google TTS / ResponsiveVoice (Indonesian Female) |
| 📺 **Monitor Display** | Tampilan TV dengan nomor antrian, video YouTube, running text, dan jam real-time |
| 🎨 **Kustomisasi Branding** | Ubah logo, warna tema, hero image, dan teks running |
| 🎭 **Tema Adaptif** | Seluruh halaman (termasuk Pengaturan) mengikuti tema warna terpilih dengan penyesuaian gelap/terang otomatis |
| 🔄 **Real-time** | Update nomor antrian secara real-time via polling |
| 🐳 **Docker Support** | Deploy sekali dengan Docker Compose, siap digunakan |
| 🔐 **HTTPS Ready** | Dukungan SSL self-signed untuk koneksi aman |

## Teknologi

| Stack | Teknologi |
|-------|-----------|
| **Frontend** | React 19, TypeScript, Tailwind CSS v4, Vite |
| **Backend** | Node.js, Express, TypeScript |
| **Database** | JSON file-based storage (local) |
| **Container** | Docker, Docker Compose, Nginx reverse-proxy |

## Screenshots

<div align="center">
  <table>
    <tr>
      <td align="center"><img src="screenshots/homepage.png" alt="Halaman Utama" width="400"/><br/><b>Halaman Utama</b></td>
      <td align="center"><img src="screenshots/Ambil nomor.png" alt="Kios Antrian" width="400"/><br/><b>Kios Ambil Nomor</b></td>
    </tr>
    <tr>
      <td align="center"><img src="screenshots/panggil page.png" alt="Panel Operator" width="400"/><br/><b>Panel Operator Loket</b></td>
      <td align="center"><img src="screenshots/monitor page.png" alt="Monitor Display" width="400"/><br/><b>Monitor Display Publik</b></td>
    </tr>
    <tr>
      <td align="center" colspan="2"><img src="screenshots/setting page.png" alt="Pengaturan" width="400"/><br/><b>Pengaturan & Kustomisasi</b></td>
    </tr>
  </table>
</div>

## Panduan Deploy

### Mode Production (CI/CD Otomatis)

Project ini menggunakan **GitHub Actions** untuk deploy otomatis ke VPS produksi
(`https://app-cube.tech`). Alur:

1. **CI** (`.github/workflows/ci.yml`) — `npm ci`, lint, dan build dijalankan setiap push/PR ke `main`.
2. **CD** (`.github/workflows/deploy.yml`) — jika CI lulus, workflow men-SSH ke VPS dan menjalankan
   `/usr/local/bin/niscaya-deploy.sh`, yang melakukan:
   - `git fetch` + `git reset --hard origin/main` di `/srv/software-antrian-niscaya`
   - Rebuild & restart container app (`docker compose -f docker-compose.yml -f docker-compose.prod.yml up -d --build app`)
   - Health check (HTTP 200) dengan rollback otomatis ke commit sebelumnya jika gagal

Cukup **push ke `main`** — deployment berjalan otomatis. Deploy manual:

```bash
# Di VPS (sebagai user deploy)
sudo /usr/local/bin/niscaya-deploy.sh            # deploy
sudo /usr/local/bin/niscaya-deploy.sh --dry-run  # lihat yang akan di-deploy
```

### Secret yang dibutuhkan GitHub Actions

Tambahkan di **Settings → Secrets and variables → Actions** repo:

| Secret | Nilai |
|--------|-------|
| `VPS_HOST` | Alamat IP VPS |
| `VPS_USER` | User SSH (biasanya `deploy`) |
| `VPS_PORT` | Port SSH (default `22`) |
| `VPS_SSH_KEY` | Private key SSH untuk user deploy |

### Mode Development

```bash
npm install
npm run dev
```

Akses di **http://localhost:3000**

## Struktur Direktori

```
├── src/                  # Kode sumber frontend & backend
│   ├── App.tsx           # Komponen utama React
│   ├── server/           # Server Express
│   └── types.ts          # Tipe TypeScript
├── public/               # Aset statis
├── assets/               # Sumber daya (favicon, dll)
├── storage/              # Data runtime (tidak di-commit)
├── ssl/                  # Sertifikat SSL (tidak di-commit)
├── .github/workflows/    # CI/CD GitHub Actions
├── docker-compose.yml    # Orkestrasi container
├── docker-compose.prod.yml # Override konfigurasi production
├── Dockerfile            # Build image
├── nginx.conf            # Reverse-proxy Nginx
└── scripts/              # Script pendukung (deploy, print)
```

## Konfigurasi

### Panel Pengaturan

Setelah login, buka menu **Pengaturan** (bottom nav) untuk mengonfigurasi:

- **Profil Instansi** — Nama, alamat, telepon, email
- **Logo** — Upload logo instansi
- **Hero Image** — Background image untuk halaman utama
- **Running Text** — Teks berjalan di monitor display
- **Video YouTube** — ID video untuk latar monitor
- **Warna Tema** — Header, tombol, background, teks
- **Loket** — Tambah/hapus loket pelayanan
- **Printer** — Metode cetak tiket (browser / Windows / Fully Kiosk)

> **Tema Adaptif:** Halaman Pengaturan otomatis mengikuti tema warna yang dipilih (Header, tombol/aksen, dan background dari tema). Panel ini menyesuaikan antara tampilan terang dan gelap secara otomatis berdasarkan warna background tema, sehingga konsisten dengan halaman Home, Kiosk, Operator, dan Monitor untuk semua preset tema.

## Lisensi

Hak cipta © 2024 PT Niscaya. All rights reserved.
