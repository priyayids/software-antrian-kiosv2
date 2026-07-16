#!/bin/bash
# Shell script to start the Niscaya Antrian app on Linux Host

echo "=========================================================="
echo "          MENYALAKAN APLIKASI ANTRIAN NISCAYA"
echo "=========================================================="
echo ""

# Check Docker
if ! command -v docker &> /dev/null; then
    echo "[ERROR] Docker tidak terdeteksi!"
    exit 1
fi

if docker compose version &> /dev/null; then
    COMPOSE_CMD="docker compose"
else
    COMPOSE_CMD="docker-compose"
fi

echo "[1/2] Menjalankan container aplikasi..."
$COMPOSE_CMD up -d

if [ $? -ne 0 ]; then
    echo "[ERROR] Gagal menyalakan aplikasi! Pastikan Docker service berjalan."
    exit 1
fi

echo ""
echo "[2/2] Aplikasi berhasil dinyalakan!"
echo "Silakan akses di http://localhost"
echo "Catatan: HTTPS (https://localhost) akan otomatis dialihkan ke HTTP."
echo "=========================================================="
echo ""
