# Build stage
FROM node:18-alpine AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./
COPY backend/package*.json ./backend/

# Install dependencies
RUN npm ci --legacy-peer-deps
RUN cd backend && npm ci --legacy-peer-deps

# Copy source code
COPY . .

# Generate Prisma clients
RUN npx prisma generate
RUN cd backend && npx prisma generate

# Build frontend
RUN npm run build

# Build backend
RUN cd backend && npm run build

# Production stage
FROM node:18-alpine AS runner

WORKDIR /app

# Install production dependencies only
COPY package*.json ./
COPY backend/package*.json ./backend/
RUN npm ci --legacy-peer-deps --omit=dev
RUN cd backend && npm ci --legacy-peer-deps --omit=dev

# Copy built application
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/backend/dist ./backend/dist
COPY --from=builder /app/backend/prisma ./backend/prisma
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=builder /app/backend/node_modules/.prisma ./backend/node_modules/.prisma

# Copy necessary files
COPY next.config.ts ./
COPY src ./src
COPY backend/src ./backend/src

# Create startup script
RUN echo '#!/bin/sh' > /app/start.sh && \
    echo 'echo "Starting application on port $PORT"' >> /app/start.sh && \
    echo 'cd /app/backend && npx prisma migrate deploy || echo "Migration failed, continuing..."' >> /app/start.sh && \
    echo 'cd /app && npx next start -p ${PORT:-3000} &' >> /app/start.sh && \
    echo 'cd /app/backend && node dist/server.js &' >> /app/start.sh && \
    echo 'wait' >> /app/start.sh && \
    chmod +x /app/start.sh

EXPOSE 3000

CMD ["/app/start.sh"]
