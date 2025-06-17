// Базовые типы для API ответов
export interface ApiResponse<T> {
  success: boolean;
  data: T;
  error?: string;
}

export interface PaginatedResponse<T> {
  items: T[];
  totalCount: number;
  page: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

// Базовая функция для API запросов
export async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const url = endpoint.startsWith('http') ? endpoint : `/api${endpoint}`;
  
  const response = await fetch(url, {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
  }

  return response.json();
}

// GET запрос
export const get = <T>(endpoint: string) => apiRequest<T>(endpoint);

// POST запрос
export const post = <T>(endpoint: string, data: any) =>
  apiRequest<T>(endpoint, {
    method: 'POST',
    body: JSON.stringify(data),
  });

// PUT запрос
export const put = <T>(endpoint: string, data: any) =>
  apiRequest<T>(endpoint, {
    method: 'PUT',
    body: JSON.stringify(data),
  });

// PATCH запрос
export const patch = <T>(endpoint: string, data: any) =>
  apiRequest<T>(endpoint, {
    method: 'PATCH',
    body: JSON.stringify(data),
  });

// DELETE запрос
export const del = <T>(endpoint: string) =>
  apiRequest<T>(endpoint, {
    method: 'DELETE',
  });

// Query keys для кэширования
export const queryKeys = {
  // Products
  products: ['products'] as const,
  productsAnalytics: (period?: number) => ['products', 'analytics', period] as const,
  productsSimple: ['products', 'simple'] as const,

  // Orders
  orders: ['orders'] as const,
  ordersList: (params?: any) => ['orders', 'list', params] as const,
  order: (id: number) => ['orders', id] as const,

  // Purchases
  purchases: ['purchases'] as const,
  purchasesList: (params?: any) => ['purchases', 'list', params] as const,
  purchase: (id: number) => ['purchases', id] as const,

  // Expenses
  expenses: ['expenses'] as const,
  expensesList: (params?: any) => ['expenses', 'list', params] as const,
  expense: (id: number) => ['expenses', id] as const,

  // Exchange rates
  rates: ['rates'] as const,
  rateLatest: (currency: string) => ['rates', 'latest', currency] as const,
} as const; 