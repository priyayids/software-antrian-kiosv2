#!/bin/bash
# Shell script for one-time installation/deployment of the Niscaya Antrian app on Linux Host

echo "=========================================================="
echo "      MEMULAI INSTALASI MANDIRI - APLIKASI ANTRIAN"
echo "=========================================================="
echo ""

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    echo "[ERROR] Docker tidak terdeteksi di sistem Anda!"
    echo "Silakan install Docker terlebih dahulu:"
    echo "curl -fsSL https://get.docker.com | sh"
    echo ""
    exit 1
fi

# Check if Docker Daemon is running
if ! docker info &> /dev/null; then
    echo "[ERROR] Docker tidak berjalan atau tidak memiliki izin root!"
    echo "Pastikan service docker aktif (sudo systemctl start docker) atau gunakan 'sudo'."
    echo ""
    exit 1
fi

echo "[1/3] Memeriksa kelengkapan file..."

# Automatically restore Dockerfile if missing
if [ ! -f "Dockerfile" ]; then
    echo "[INFO] Dockerfile tidak ditemukan. Membuat Dockerfile otomatis..."
    cat << 'EOF' > Dockerfile
# Stage 1: Build the application
FROM node:20-alpine AS builder

WORKDIR /app

# Copy dependency manifests
COPY package*.json ./

# Install all dependencies
RUN npm install --no-audit --no-fund

# Copy the rest of the application files
COPY . .

# Build frontend and compile backend
RUN npm run build

# Stage 2: Runtime environment
FROM node:20-alpine AS runner

WORKDIR /app

# Set production environment
ENV NODE_ENV=production

# Copy built artifacts and package manifests from the builder stage
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/package*.json ./

# Install only production dependencies
RUN npm install --omit=dev --no-audit --no-fund

# Create storage directory for local persistence
RUN mkdir -p storage

# Expose the internal port that the app listens to (3000)
EXPOSE 3000

# Start the application
CMD ["npm", "run", "start"]
EOF
    echo "[OK] Dockerfile berhasil dibuat."
fi

# Automatically generate .env if missing
if [ ! -f ".env" ] && [ -f ".env.example" ]; then
    echo "[INFO] File .env tidak ditemukan. Menyalin dari .env.example..."
    cp .env.example .env
    echo "[OK] .env berhasil dibuat."
fi

# Automatically generate self-signed SSL certificates for HTTPS redirect if missing
if [ ! -d "ssl" ]; then
    mkdir -p ssl
fi

if [ ! -f "ssl/server.crt" ] || [ ! -f "ssl/server.key" ]; then
    echo "[INFO] Membuat sertifikat SSL mandiri (Self-Signed) untuk HTTPS..."
    # Attempt to use local openssl first
    if command -v openssl &> /dev/null; then
        openssl req -x509 -nodes -days 3650 -newkey rsa:2048 \
            -keyout ssl/server.key -out ssl/server.crt \
            -subj "/C=ID/ST=Jakarta/L=Jakarta/O=Niscaya/OU=IT/CN=localhost" &> /dev/null
        echo "[OK] Sertifikat SSL berhasil dibuat lokal di folder ssl/."
    else
        # If openssl not on host, try via a temporary docker container to keep it ultra-robust
        echo "[INFO] openssl tidak terdeteksi pada host. Mencoba membuat sertifikat via Docker Alpine..."
        docker run --rm -v "$(pwd)/ssl:/export" alpine sh -c "apk add --no-cache openssl && openssl req -x509 -nodes -days 3650 -newkey rsa:2048 -keyout /export/server.key -out /export/server.crt -subj '/C=ID/ST=Jakarta/L=Jakarta/O=Niscaya/OU=IT/CN=localhost'" &> /dev/null
        if [ $? -eq 0 ] && [ -f "ssl/server.crt" ]; then
            echo "[OK] Sertifikat SSL berhasil dibuat via Docker Alpine di folder ssl/."
        else
            echo "[WARN] Gagal membuat sertifikat SSL otomatis. Membuat file dummy untuk mencegah kegagalan start Nginx."
            echo "placeholder-key" > ssl/server.key
            echo "placeholder-cert" > ssl/server.crt
        fi
    fi
fi

echo "[2/4] Memeriksa status docker compose..."
# Determine docker-compose or docker compose
USE_COMPOSE_PLUGIN=true
if docker compose version &> /dev/null; then
    COMPOSE_CMD="docker compose"
elif command -v docker-compose &> /dev/null; then
    COMPOSE_CMD="docker-compose"
    USE_COMPOSE_PLUGIN=false
else
    echo "[ERROR] Docker Compose tidak ditemukan!"
    echo "Silakan install docker-compose atau docker-compose-plugin."
    exit 1
fi

echo "[3/4] Membangun dan menjalankan container (proses pertama kali)..."
$COMPOSE_CMD down &> /dev/null

# Try building with BuildKit disabled to maximize compatibility (fixes BuildKit/buildx errors)
echo "Menjalankan build tanpa BuildKit untuk memastikan kecocokan penuh..."
DOCKER_BUILDKIT=0 COMPOSE_DOCKER_CLI_BUILD=0 $COMPOSE_CMD up -d --build

if [ $? -ne 0 ]; then
    echo ""
    echo "[INFO] Percobaan pertama gagal, mencoba build standar..."
    $COMPOSE_CMD up -d --build
fi

if [ $? -ne 0 ]; then
    echo ""
    echo "[ERROR] Gagal menjalankan build!"
    echo "Tips Troubleshooting:"
    echo "1. Pasang plugin buildx jika diperlukan: sudo apt-get update && sudo apt-get install -y docker-buildx-plugin"
    echo "2. Atau matikan buildkit: export DOCKER_BUILDKIT=0"
    echo ""
    exit 1
fi

echo ""
echo "[4/4] Instalasi selesai!"
echo "=========================================================="
echo "Aplikasi Antrian Niscaya berhasil dipasang dan berjalan."
echo ""
echo "Silakan akses melalui browser di alamat berikut:"
echo "- Tampilan Utama / Menu: http://localhost"
echo "  (Jika Anda membuka https://localhost, Nginx akan otomatis mengalihkan ke http)"
echo ""
echo "Catatan:"
echo "- Gunakan ./start.sh untuk menyalakan aplikasi sehari-hari."
echo "- Gunakan ./stop.sh untuk mematikan aplikasi dengan aman."
echo "=========================================================="
echo ""
