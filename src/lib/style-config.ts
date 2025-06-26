/**
 * Конфигурация стилей веб-приложения
 * Теперь использует только Tailwind CSS
 */

// Функция для логирования режима стилей
export const logStyleMode = () => {
  console.log('🎨 Webapp styles mode: Tailwind CSS');
};

// Типы для TypeScript
export type StyleMode = 'tailwind';
export const currentStyleMode: StyleMode = 'tailwind';

// Конфигурация стилей для веб-приложения
export const useWebappTailwind = true; // Всегда используем Tailwind для веб-приложения 