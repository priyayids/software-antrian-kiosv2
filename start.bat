@echo off
:: Batch script for daily startup of the Niscaya Antrian app on Windows Host
title Niscaya Antrian - Daily Start

echo ==========================================================
echo           MENYALAKAN APLIKASI ANTRIAN NISCAYA
echo ==========================================================
echo.

:: Check if Docker is installed
where docker >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] Docker Desktop tidak terdeteksi!
    pause
    exit /b 1
)

echo [1/2] Menjalankan container aplikasi...
docker compose up -d

if %errorlevel% neq 0 (
    echo [ERROR] Gagal menyalakan aplikasi! Pastikan Docker Desktop sudah berjalan.
    pause
    exit /b 1
)

echo.
echo [2/2] Membuka aplikasi di peramban (browser)...
start http://localhost

echo.
echo ==========================================================
echo Aplikasi berhasil dinyalakan!
echo Halaman utama telah dibuka di browser Anda.
echo ==========================================================
echo.
timeout /t 5
