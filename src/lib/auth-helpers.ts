import { getServerSession, Session } from "next-auth";
import { authOptions } from "@/libs/auth";
import { prisma } from "@/libs/prismaDb";

// Типы для разрешений
export enum Permission {
  // Пользователи
  USER_VIEW = "user.view",
  USER_CREATE = "user.create",
  USER_UPDATE = "user.update",
  USER_DELETE = "user.delete",
  
  // Товары
  PRODUCT_VIEW = "product.view",
  PRODUCT_CREATE = "product.create",
  PRODUCT_UPDATE = "product.update",
  PRODUCT_DELETE = "product.delete",
  
  // Заказы
  ORDER_VIEW = "order.view",
  ORDER_UPDATE = "order.update",
  ORDER_DELETE = "order.delete",
  
  // Отчеты
  ANALYTICS_VIEW = "analytics.view",
  
  // Настройки
  SETTINGS_VIEW = "settings.view",
  SETTINGS_UPDATE = "settings.update",
  
  // Критические операции
  CRITICAL_OPERATIONS = "critical.operations",
}

// Маппинг ролей на разрешения
export const ROLE_PERMISSIONS: Record<string, Permission[]> = {
  ADMIN: Object.values(Permission), // Админы имеют все разрешения
  MANAGER: [
    Permission.USER_VIEW,
    Permission.PRODUCT_VIEW,
    Permission.PRODUCT_UPDATE,
    Permission.ORDER_VIEW,
    Permission.ORDER_UPDATE,
    Permission.ANALYTICS_VIEW,
  ],
  USER: [
    Permission.PRODUCT_VIEW,
    Permission.ORDER_VIEW,
  ],
};

// Проверка, является ли пользователь администратором
export async function isAdmin(session: Session | null): Promise<boolean> {
  if (!session?.user?.email) return false;

  // Получаем список админских email из переменной окружения
  const adminEmails = process.env.ADMIN_EMAILS?.split(',').map(e => e.trim().toLowerCase()) || [];
  
  // Если список пуст, используем дефолтный email
  if (adminEmails.length === 0) {
    adminEmails.push('go@osama.agency');
  }

  return adminEmails.includes(session.user.email.toLowerCase());
}

// Проверка прав доступа с учетом разрешений
export async function checkAccess(
  session: Session | null,
  requiredPermissions?: Permission[]
): Promise<boolean> {
  if (!session?.user) return false;

  try {
    const user = await prisma.telesklad_user.findUnique({
      where: { id: session.user.id },
    });

    if (!user) return false;

    // Получаем разрешения для роли пользователя
    const userPermissions = ROLE_PERMISSIONS[user.role || 'USER'] || [];

    // Если не указаны конкретные разрешения, просто проверяем авторизацию
    if (!requiredPermissions || requiredPermissions.length === 0) {
      return true;
    }

    // Проверяем, есть ли у пользователя все необходимые разрешения
    return requiredPermissions.every(permission => 
      userPermissions.includes(permission)
    );
  } catch (error) {
    console.error('Error checking access:', error);
    return false;
  }
}

// Проверка доступа к критическим операциям
export async function checkCriticalAccess(session: Session | null): Promise<boolean> {
  if (!session?.user?.email) return false;

  // Для критических операций проверяем и роль, и email
  const hasAdminRole = await checkAccess(session, [Permission.CRITICAL_OPERATIONS]);
  const isAdminEmail = await isAdmin(session);

  return hasAdminRole && isAdminEmail;
}

// Хелпер для использования в серверных компонентах
export async function requireAuth(requiredPermissions?: Permission[]) {
  const session = await getServerSession(authOptions);
  
  if (!session) {
    throw new Error('Unauthorized');
  }

  const hasAccess = await checkAccess(session, requiredPermissions);
  
  if (!hasAccess) {
    throw new Error('Access Denied');
  }

  return session;
}

// Получение текущего пользователя с проверкой прав
export async function getCurrentUser() {
  const session = await getServerSession(authOptions);
  
  if (!session?.user?.email) {
    return null;
  }

  const user = await prisma.telesklad_user.findUnique({
    where: { email: session.user.email },
    select: {
      id: true,
      name: true,
      email: true,
      image: true,
      role: true,
    }
  });

  return user;
} 