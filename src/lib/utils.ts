import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Рекурсивно обходит объект или массив и преобразует все значения BigInt и Decimal в строки.
 * Это необходимо, так как JSON.stringify не может обрабатывать BigInt и Prisma Decimal.
 * @param obj - Объект, массив или примитивное значение для обработки.
 * @returns - Глубокая копия объекта с преобразованными BigInt и Decimal.
 */
export function serializeBigInts<T>(obj: T): T {
  if (obj === null || obj === undefined) {
    return obj;
  }

  if (typeof obj === 'bigint') {
    return obj.toString() as any;
  }

  // Обработка Date объектов - возвращаем ISO строку
  if (obj instanceof Date) {
    return obj.toISOString() as any;
  }

  // Обработка Prisma Decimal - проверяем наличие метода toString у объекта
  if (typeof obj === 'object' && obj !== null && 'toString' in obj && typeof (obj as any).toString === 'function') {
    // Проверяем, является ли это Decimal объектом (у него есть свойства s, e, d)
    if ('s' in obj && 'e' in obj && 'd' in obj) {
      return (obj as any).toString() as any;
    }
    // Дополнительная проверка для других Decimal-подобных объектов
    if (obj.constructor && obj.constructor.name === 'Decimal') {
      return (obj as any).toString() as any;
    }
  }

  if (Array.isArray(obj)) {
    return obj.map(item => serializeBigInts(item)) as any;
  }

  if (typeof obj === 'object') {
    const newObj: { [key: string]: any } = {};
    for (const key in obj) {
      if (Object.prototype.hasOwnProperty.call(obj, key)) {
        newObj[key] = serializeBigInts((obj as any)[key]);
      }
    }
    return newObj as T;
  }

  return obj;
}
