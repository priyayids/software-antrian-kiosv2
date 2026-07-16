#!/bin/bash
# Shell script to stop the Niscaya Antrian app on Linux Host

echo "=========================================================="
echo "          MEMATIKAN APLIKASI ANTRIAN NISCAYA"
echo "=========================================================="
echo ""

if docker compose version &> /dev/null; then
    COMPOSE_CMD="docker compose"
else
    COMPOSE_CMD="docker-compose"
fi

echo "Mematikan container aplikasi dengan aman..."
$COMPOSE_CMD down

echo ""
echo "=========================================================="
echo "Aplikasi Antrian Niscaya telah dimatikan secara bersih."
echo "=========================================================="
echo ""
