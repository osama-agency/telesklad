import { PrismaClient } from "@prisma/client";

const globalForPrisma = global as unknown as { prisma: PrismaClient };

export const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
    datasources: {
      db: {
        url: `${process.env.DATABASE_URL}?connection_limit=20&pool_timeout=30&connect_timeout=60`
      }
    },
    // Добавляем настройки для лучшего управления подключениями
    transactionOptions: {
      maxWait: 15000, // максимальное время ожидания транзакции
      timeout: 45000, // таймаут транзакции
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

// Принудительно закрываем неиспользуемые подключения каждые 30 секунд
setInterval(async () => {
  try {
    await prisma.$executeRaw`SELECT 1`;
  } catch (error) {
    // Игнорируем ошибки
  }
}, 30000);
