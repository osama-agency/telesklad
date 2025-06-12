# Build stage
FROM node:18-alpine AS builder

WORKDIR /app

# Copy all files
COPY . .

# Install dependencies
RUN npm ci --legacy-peer-deps
RUN cd backend && npm ci --legacy-peer-deps

# Generate Prisma clients
RUN npx prisma generate
RUN cd backend && npx prisma generate

# Build frontend
RUN npm run build

# Build backend
RUN cd backend && npm run build

# Production stage
FROM node:18-alpine

WORKDIR /app

# Copy everything from builder
COPY --from=builder /app .

# Expose port
EXPOSE 3000

# Start the application
CMD ["sh", "-c", "cd backend && npx prisma migrate deploy || true && cd /app && node start-production.js"]
