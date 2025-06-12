# Build stage
FROM node:18-alpine AS builder

WORKDIR /app

# Install necessary packages for Prisma
RUN apk add --no-cache openssl

# Copy package files first
COPY package*.json ./
COPY backend/package*.json ./backend/

# Install dependencies
RUN npm ci --legacy-peer-deps
RUN cd backend && npm ci --legacy-peer-deps

# Copy source code
COPY . .

# Generate icons after source code is available
RUN npm run build:icons

# Generate Prisma clients with correct binary targets
RUN cd backend && ./node_modules/.bin/prisma generate

# Build frontend
RUN npm run build

# Build backend
RUN cd backend && npm run build

# Production stage
FROM node:18-alpine

WORKDIR /app

# Install openssl for Prisma
RUN apk add --no-cache openssl

# Copy everything from builder
COPY --from=builder /app .

# Set production environment
ENV NODE_ENV=production
ENV BACKEND_URL=http://localhost:3011

# Expose port
EXPOSE 3000

# Start the application
CMD ["node", "start-production.js"]
