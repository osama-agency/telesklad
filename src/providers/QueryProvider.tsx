"use client";

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { useState, type PropsWithChildren } from 'react';

export default function QueryProvider({ children }: PropsWithChildren) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            // Время, в течение которого данные считаются свежими
            staleTime: 5 * 60 * 1000, // 5 минут
            // Время кэширования в памяти
            gcTime: 10 * 60 * 1000, // 10 минут (было cacheTime в старых версиях)
            // Повторить запрос при ошибке
            retry: (failureCount, error: any) => {
              // Не повторять для 4xx ошибок
              if (error?.status >= 400 && error?.status < 500) {
                return false;
              }
              // Максимум 3 попытки
              return failureCount < 3;
            },
            // Повторить запрос при фокусе окна
            refetchOnWindowFocus: false,
            // Повторить при восстановлении соединения
            refetchOnReconnect: true,
          },
          mutations: {
            // Повторить мутацию при ошибке
            retry: (failureCount, error: any) => {
              if (error?.status >= 400 && error?.status < 500) {
                return false;
              }
              return failureCount < 2;
            },
          },
        },
      }),
  );

  return (
    <QueryClientProvider client={queryClient}>
      {children}
      {/* Показываем DevTools только в dev режиме */}
      {process.env.NODE_ENV === 'development' && (
        <ReactQueryDevtools
          initialIsOpen={false}
        />
      )}
    </QueryClientProvider>
  );
} 