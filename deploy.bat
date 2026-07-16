@echo off
:: Batch script for one-time installation/deployment of the Niscaya Antrian app on Windows Host
title Niscaya Antrian - One-time Deployment

echo ==========================================================
echo       MEMULAI INSTALASI MANDIRI - APLIKASI ANTRIAN
echo ==========================================================
echo.

:: Check if Docker is installed
where docker >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] Docker Desktop tidak terdeteksi di sistem Anda!
    echo Silakan install Docker Desktop terlebih dahulu dari https://www.docker.com/products/docker-desktop
    echo.
    pause
    exit /b 1
)

echo [1/3] Memeriksa status Docker Daemon...
docker info >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] Docker tidak berjalan! Silakan buka Docker Desktop terlebih dahulu.
    echo.
    pause
    exit /b 1
)

echo [2/3] Membangun dan menjalankan container (proses pertama kali)...
docker compose down >nul 2>&1
docker compose up -d --build

if %errorlevel% neq 0 (
    echo.
    echo [ERROR] Gagal menjalankan docker compose!
    echo Silakan periksa log atau hubungi administrator.
    echo.
    pause
    exit /b 1
)

echo.
echo [3/3] Instalasi selesai!
echo ==========================================================
echo Aplikasi Antrian Niscaya berhasil dipasang dan berjalan.
echo.
echo Silakan akses melalui browser di alamat berikut:
echo - Tampilan Utama / Menu: http://localhost
echo.
echo Catatan:
echo - Gunakan start.bat untuk menyalakan aplikasi sehari-hari.
echo - Gunakan stop.bat untuk mematikan aplikasi dengan aman.
echo ==========================================================
echo.
pause
