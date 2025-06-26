import { PrismaClient } from "@prisma/client";

const globalForPrisma = global as unknown as { prisma: PrismaClient };

export const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
    datasources: {
      db: {
        url: `${process.env.DATABASE_URL}?connection_limit=5&pool_timeout=20&connect_timeout=30`
      }
    },
    // Добавляем настройки для лучшего управления подключениями
    transactionOptions: {
      maxWait: 10000, // уменьшено с 15000
      timeout: 30000, // уменьшено с 45000
    },
  });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;

// Graceful shutdown
process.on('beforeExit', async () => {
  await prisma.$disconnect();
});

process.on('SIGINT', async () => {
  await prisma.$disconnect();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  await prisma.$disconnect();
  process.exit(0);
});

// ❌ УБРАНО: setInterval вызывал избыточные подключения
// Prisma автоматически управляет пулом соединений
