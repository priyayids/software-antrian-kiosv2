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
