@echo off
:: Batch script to stop the Niscaya Antrian app on Windows Host
title Niscaya Antrian - Stop Application

echo ==========================================================
echo           MEMATIKAN APLIKASI ANTRIAN NISCAYA
echo ==========================================================
echo.

:: Check if Docker is installed
where docker >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] Docker Desktop tidak terdeteksi!
    pause
    exit /b 1
)

echo Mematikan container aplikasi dengan aman...
docker compose down

echo.
echo ==========================================================
echo Aplikasi Antrian Niscaya telah dimatikan secara bersih.
echo ==========================================================
echo.
timeout /t 5
