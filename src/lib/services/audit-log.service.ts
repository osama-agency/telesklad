import { prisma } from "@/libs/prismaDb";

export interface AuditLogEntry {
  userId: string;
  action: string;
  resource: string;
  resourceId?: string;
  details?: any;
  ip?: string;
  userAgent?: string;
}

export class AuditLogService {
  /**
   * Создает запись в журнале аудита
   */
  static async log(entry: AuditLogEntry): Promise<void> {
    try {
      // Временно используем консольное логирование
      // В будущем будем записывать в БД после миграции
      const logEntry = {
        ...entry,
        timestamp: new Date().toISOString(),
      };
      
      console.log('[AUDIT]', JSON.stringify(logEntry));

      // TODO: После применения миграции раскомментировать
      // await prisma.auditLog.create({
      //   data: {
      //     userId: entry.userId,
      //     action: entry.action,
      //     resource: entry.resource,
      //     resourceId: entry.resourceId,
      //     details: entry.details,
      //     ip: entry.ip || 'unknown',
      //     userAgent: entry.userAgent || 'unknown',
      //   },
      // });
    } catch (error) {
      // Не прерываем основной процесс, если логирование не удалось
      console.error('[AuditLog] Failed to create audit log entry:', error);
    }
  }

  /**
   * Логирование действий аутентификации
   */
  static async logAuth(
    userId: string,
    action: 'LOGIN' | 'LOGOUT' | 'PASSWORD_CHANGED' | 'PASSWORD_RESET',
    success: boolean,
    details?: any
  ): Promise<void> {
    await this.log({
      userId,
      action: `AUTH_${action}`,
      resource: 'auth',
      details: {
        ...details,
        success,
        timestamp: new Date().toISOString(),
      },
    });
  }

  /**
   * Логирование действий с пользователями
   */
  static async logUserAction(
    userId: string,
    action: 'CREATE' | 'UPDATE' | 'DELETE' | 'VIEW',
    targetUserId: string,
    details?: any
  ): Promise<void> {
    await this.log({
      userId,
      action: `USER_${action}`,
      resource: 'user',
      resourceId: targetUserId,
      details,
    });
  }

  /**
   * Логирование действий с товарами
   */
  static async logProductAction(
    userId: string,
    action: 'CREATE' | 'UPDATE' | 'DELETE' | 'VIEW',
    productId: string,
    details?: any
  ): Promise<void> {
    await this.log({
      userId,
      action: `PRODUCT_${action}`,
      resource: 'product',
      resourceId: productId,
      details,
    });
  }

  /**
   * Логирование действий с заказами
   */
  static async logOrderAction(
    userId: string,
    action: 'CREATE' | 'UPDATE' | 'DELETE' | 'VIEW',
    orderId: string,
    details?: any
  ): Promise<void> {
    await this.log({
      userId,
      action: `ORDER_${action}`,
      resource: 'order',
      resourceId: orderId,
      details,
    });
  }

  /**
   * Логирование критических операций
   */
  static async logCriticalAction(
    userId: string,
    action: string,
    resource: string,
    details?: any
  ): Promise<void> {
    await this.log({
      userId,
      action: `CRITICAL_${action}`,
      resource,
      details: {
        ...details,
        level: 'critical',
        timestamp: new Date().toISOString(),
      },
    });
  }

  /**
   * Получение логов по пользователю (временно возвращает пустой массив)
   */
  static async getUserLogs(userId: string, limit = 100) {
    // TODO: После применения миграции
    return [];
  }

  /**
   * Получение логов по ресурсу (временно возвращает пустой массив)
   */
  static async getResourceLogs(resource: string, resourceId?: string, limit = 100) {
    // TODO: После применения миграции
    return [];
  }

  /**
   * Получение критических логов (временно возвращает пустой массив)
   */
  static async getCriticalLogs(limit = 100) {
    // TODO: После применения миграции
    return [];
  }
} 