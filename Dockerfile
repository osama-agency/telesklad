# Multi-stage build для оптимизации размера образа
FROM node:18-alpine AS base

# Установка системных зависимостей
RUN apk add --no-cache \
    openssl \
    postgresql-client \
    curl \
    bash

WORKDIR /app

# Копируем package files
COPY package*.json ./
COPY backend/package*.json ./backend/

# Build stage
FROM base AS builder

            # Устанавливаем все dependencies для сборки (без postinstall)
    RUN npm ci --legacy-peer-deps --ignore-scripts
    RUN cd backend && npm ci --legacy-peer-deps --ignore-scripts

    # Копируем исходный код
    COPY . .

    # Генерируем Prisma client для Alpine Linux
    RUN cd backend && npx prisma generate

    # Компилируем backend TypeScript код
    RUN cd backend && npm run build

    # Генерируем иконки
    RUN npm run build:icons || echo "Icons generation skipped"

# Собираем frontend
RUN npm run build

# Собираем backend
RUN cd backend && npm run build

# Production stage
FROM base AS production

# Создаем пользователя для безопасности
RUN addgroup -g 1001 -S nodejs
RUN adduser -S nextjs -u 1001

# Копируем только production файлы
COPY --from=builder --chown=nextjs:nodejs /app/node_modules ./node_modules
COPY --from=builder --chown=nextjs:nodejs /app/backend/node_modules ./backend/node_modules
COPY --from=builder --chown=nextjs:nodejs /app/backend/dist ./backend/dist
COPY --from=builder --chown=nextjs:nodejs /app/backend/prisma ./backend/prisma
COPY --from=builder --chown=nextjs:nodejs /app/.next ./.next
COPY --from=builder --chown=nextjs:nodejs /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/package*.json ./
COPY --from=builder --chown=nextjs:nodejs /app/backend/package*.json ./backend/

# Копируем start script
COPY --chown=nextjs:nodejs docker-entrypoint.sh ./
RUN chmod +x docker-entrypoint.sh

# Переключаемся на пользователя nextjs
USER nextjs

# Устанавливаем переменные окружения
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=3000

# Открываем порт
EXPOSE 3000

# Healthcheck
HEALTHCHECK --interval=30s --timeout=10s --start-period=60s --retries=3 \
  CMD curl -f http://localhost:3000/api/health || exit 1

# Запускаем приложение
CMD ["./docker-entrypoint.sh"]
