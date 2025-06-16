"use client";

// Используем встроенную иконку поиска
import usePurchaseCartStore from "@/lib/stores/purchaseCartStore";
import FloatingCart from "@/components/PurchaseCart/FloatingCart";
import { Suspense, useState, useEffect } from "react";

function ProductsTableContent() {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [globalFilter, setGlobalFilter] = useState("");
  const [pageSize, setPageSize] = useState(10);
  const [currentPage, setCurrentPage] = useState(0);
  const { addItem } = usePurchaseCartStore();

  // Загружаем товары из простого API
  useEffect(() => {
    const loadProducts = async () => {
      try {
        setLoading(true);
        setError(null);
        
        console.log('🔧 Loading products from simple API...');
        const response = await fetch('/api/products/simple');
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const result = await response.json();
        
        console.log('🔧 API Response:', result);
        
        if (result.success && result.data && result.data.products && Array.isArray(result.data.products)) {
          // Дополнительная фильтрация на фронтенде: только товары с ancestry содержащим "/"
          const filteredProducts = result.data.products.filter((p: any) => p.ancestry?.includes('/'));
          setProducts(filteredProducts);
        } else {
          console.error('❌ Invalid API response structure:', result);
          throw new Error('Invalid API response structure');
        }

      } catch (error) {
        console.error('❌ Error loading products:', error);
        setError(error instanceof Error ? error.message : 'Unknown error');
      } finally {
        setLoading(false);
      }
    };

    loadProducts();
  }, []);

  // Фильтрация товаров
  const filteredProducts = products.filter(product =>
    product.name.toLowerCase().includes(globalFilter.toLowerCase())
  );

  // Пагинация
  const totalPages = Math.ceil(filteredProducts.length / pageSize);
  const startIndex = currentPage * pageSize;
  const paginatedProducts = filteredProducts.slice(startIndex, startIndex + pageSize);

  const handleAddToCart = (product: any) => {
    addItem(product, 1);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  if (loading) {
    return (
      <section className="data-table-common rounded-[10px] bg-white shadow-1 dark:bg-gray-dark dark:shadow-card">
        <div className="flex items-center justify-center py-16">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          <span className="ml-3 text-dark dark:text-white">Загрузка товаров...</span>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="data-table-common rounded-[10px] bg-white shadow-1 dark:bg-gray-dark dark:shadow-card">
        <div className="flex items-center justify-center py-16">
          <div className="text-red-500 dark:text-red-400">Ошибка: {error}</div>
        </div>
      </section>
    );
  }

  return (
    <section className="data-table-common rounded-[10px] bg-white shadow-1 dark:bg-gray-dark dark:shadow-card">
      {/* Header with search and pagination controls */}
      <div className="flex flex-col gap-4 border-b border-stroke px-7.5 py-4.5 dark:border-dark-3 sm:flex-row-reverse sm:items-center sm:justify-between sm:gap-x-4 sm:gap-y-0">
        <div className="relative z-20 w-full max-w-[414px]">
          <input
            type="text"
            value={globalFilter}
            onChange={(e) => {
              setGlobalFilter(e.target.value);
              setCurrentPage(0); // Reset to first page when searching
            }}
            className="w-full rounded-lg border border-stroke bg-transparent px-5 py-2.5 outline-none focus:border-primary dark:border-dark-3 dark:bg-dark-2 dark:focus:border-primary dark:text-white"
            placeholder="Поиск товаров..."
          />
          <button className="absolute right-0 top-0 flex h-11.5 w-11.5 items-center justify-center rounded-r-md bg-primary text-white hover:bg-opacity-90 transition-colors duration-200">
            <svg
              width="18"
              height="18"
              viewBox="0 0 18 18"
              fill="currentColor"
              className="size-4.5"
            >
              <path
                fillRule="evenodd"
                clipRule="evenodd"
                d="M8.625 2.0625C5.00063 2.0625 2.0625 5.00063 2.0625 8.625C2.0625 12.2494 5.00063 15.1875 8.625 15.1875C12.2494 15.1875 15.1875 12.2494 15.1875 8.625C15.1875 5.00063 12.2494 2.0625 8.625 2.0625ZM0.9375 8.625C0.9375 4.37931 4.37931 0.9375 8.625 0.9375C12.8707 0.9375 16.3125 4.37931 16.3125 8.625C16.3125 10.5454 15.6083 12.3013 14.4441 13.6487L16.8977 16.1023C17.1174 16.3219 17.1174 16.6781 16.8977 16.8977C16.6781 17.1174 16.3219 17.1174 16.1023 16.8977L13.6487 14.4441C12.3013 15.6083 10.5454 16.3125 8.625 16.3125C4.37931 16.3125 0.9375 12.8707 0.9375 8.625Z"
              />
            </svg>
          </button>
        </div>

        <div className="flex items-center font-medium">
          <p className="pl-2 font-medium text-dark dark:text-white">
            На странице:
          </p>
          <select
            value={pageSize}
            onChange={(e) => {
              setPageSize(Number(e.target.value));
              setCurrentPage(0);
            }}
            className="bg-transparent pl-2.5 text-dark dark:text-white border-none outline-none"
          >
            {[5, 10, 20, 50].map((size) => (
              <option key={size} value={size} className="bg-white dark:bg-gray-dark text-dark dark:text-white">
                {size}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Desktop Table - скрыта на мобильных */}
      <div className="hidden md:block grid grid-cols-1 overflow-x-auto">
        <table className="datatable-table datatable-one !border-collapse px-4 md:px-8 w-full">
          <thead className="border-separate px-4">
            <tr className="border-t border-stroke dark:border-dark-3">
              <th className="whitespace-nowrap border-transparent px-2.5 pb-2.5 pt-9 font-medium text-dark dark:text-white text-left">
                Название товара
              </th>
              <th className="whitespace-nowrap border-transparent px-2.5 pb-2.5 pt-9 font-medium text-dark dark:text-white text-left">
                Себестоимость (₺)
              </th>
              <th className="whitespace-nowrap border-transparent px-2.5 pb-2.5 pt-9 font-medium text-dark dark:text-white text-left">
                В пути
              </th>
              <th className="whitespace-nowrap border-transparent px-2.5 pb-2.5 pt-9 font-medium text-dark dark:text-white text-left">
                Действия
              </th>
            </tr>
          </thead>

          <tbody>
            {paginatedProducts.length === 0 ? (
              <tr className="border-t border-stroke dark:border-dark-3">
                <td colSpan={4} className="py-12 text-center font-medium text-dark-5 dark:text-dark-6">
                  {globalFilter ? 'Товары не найдены по запросу' : 'Товары не найдены'}
                </td>
              </tr>
            ) : (
              paginatedProducts.map((product, index) => (
                <tr
                  key={product.id}
                  className="border-t border-stroke hover:bg-primary hover:bg-opacity-5 dark:border-dark-3 transition-colors duration-200"
                >
                  <td className="border-b border-stroke py-5 px-2.5 font-medium text-primary dark:border-dark-3 dark:text-white">
                    <div className="flex items-center">
                      <span className="font-medium">{product.name}</span>
                    </div>
                  </td>
                  <td className="border-b border-stroke py-5 px-2.5 font-medium dark:border-dark-3">
                    <span className="inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400">
                      {product.prime_cost && product.prime_cost > 0 ? `₺${product.prime_cost.toFixed(2)}` : '—'}
                    </span>
                  </td>
                  <td className="border-b border-stroke py-5 px-2.5 font-medium text-dark-5 dark:border-dark-3 dark:text-dark-6">
                    <span className="inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium bg-gray-50 text-gray-600 dark:bg-gray-800 dark:text-gray-300">
                      {product.inTransit || 0} шт.
                    </span>
                  </td>
                  <td className="border-b border-stroke py-5 px-2.5 font-medium dark:border-dark-3">
                    <button
                      onClick={() => handleAddToCart(product)}
                      className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-center font-medium text-white hover:bg-opacity-90 transition-all duration-200 hover:shadow-md"
                    >
                      <svg 
                        className="w-4 h-4 mr-1.5" 
                        fill="none" 
                        stroke="currentColor" 
                        viewBox="0 0 24 24"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                      </svg>
                      В корзину
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Mobile Cards - показаны только на мобильных */}
      <div className="md:hidden space-y-4 p-4">
        {paginatedProducts.length === 0 ? (
          <div className="py-12 text-center">
            <div className="text-gray-400 dark:text-gray-500 mb-4">
              <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
              </svg>
            </div>
            <p className="font-medium text-dark-5 dark:text-dark-6">
              {globalFilter ? 'Товары не найдены по запросу' : 'Товары не найдены'}
            </p>
          </div>
        ) : (
          paginatedProducts.map((product, index) => (
            <div
              key={product.id}
              className="bg-[#F8FAFC] dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4 shadow-sm hover:shadow-md transition-all duration-300"
            >
              {/* Header с названием товара */}
              <div className="mb-3">
                <h3 className="font-bold text-[#1E293B] dark:text-white text-lg mb-1">
                  {product.name}
                </h3>
              </div>

              {/* Информация о товаре */}
              <div className="space-y-3 mb-4">
                {/* Цена в рублях */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <svg className="w-4 h-4 text-[#64748B] dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                    </svg>
                    <span className="text-sm text-[#64748B] dark:text-gray-400">Цена:</span>
                  </div>
                  <span className="inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium bg-green-50 text-green-600 dark:bg-green-900/20 dark:text-green-400">
                    {product.priceInRub && product.priceInRub > 0 ? `${product.priceInRub.toFixed(0)} ₽` : '—'}
                  </span>
                </div>

                {/* Себестоимость */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <svg className="w-4 h-4 text-[#64748B] dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                    </svg>
                    <span className="text-sm text-[#64748B] dark:text-gray-400">Себестоимость:</span>
                  </div>
                  <span className="inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400">
                    {product.prime_cost && product.prime_cost > 0 ? `₺${product.prime_cost.toFixed(2)}` : '—'}
                  </span>
                </div>

                {/* В пути */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <svg className="w-4 h-4 text-[#64748B] dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                    </svg>
                    <span className="text-sm text-[#64748B] dark:text-gray-400">В пути:</span>
                  </div>
                  <span className="inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium bg-gray-50 text-gray-600 dark:bg-gray-800 dark:text-gray-300">
                    {product.inTransit || 0} шт.
                  </span>
                </div>
              </div>

              {/* Кнопка действия */}
              <button
                onClick={() => handleAddToCart(product)}
                className="w-full bg-gradient-to-r from-[#1A6DFF] to-[#00C5FF] text-white px-4 py-3 rounded-lg hover:scale-105 transition-all duration-300 font-medium flex items-center justify-center gap-2"
              >
                <svg 
                  className="w-4 h-4" 
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                    strokeWidth="2" 
                    d="M12 6v6m0 0v6m0-6h6m-6 0H6" 
                  />
                </svg>
                Добавить в корзину
              </button>
            </div>
          ))
        )}
      </div>

      {/* Pagination */}
      <div className="flex flex-col gap-4 px-7.5 py-7 sm:flex-row sm:items-center sm:justify-between sm:gap-0">
        <div className="flex items-center">
          <button
            className="flex items-center justify-center rounded-[3px] p-[7px] hover:bg-primary hover:text-white disabled:pointer-events-none disabled:opacity-50 transition-colors duration-200 text-dark-5 dark:text-dark-6"
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 0}
          >
            <svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
              <polyline points="15,18 9,12 15,6"></polyline>
            </svg>
          </button>

          {Array.from({ length: totalPages }, (_, index) => index).map((pageIndex) => (
            <button
              key={pageIndex}
              onClick={() => handlePageChange(pageIndex)}
              className={`mx-1 flex items-center justify-center rounded-[3px] p-1.5 px-[15px] font-medium transition-colors duration-200 hover:bg-primary hover:text-white ${
                currentPage === pageIndex
                  ? "bg-primary text-white"
                  : "text-dark-5 dark:text-dark-6"
              }`}
            >
              {pageIndex + 1}
            </button>
          ))}

          <button
            className="flex items-center justify-center rounded-[3px] p-[7px] hover:bg-primary hover:text-white disabled:pointer-events-none disabled:opacity-50 transition-colors duration-200 text-dark-5 dark:text-dark-6"
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage >= totalPages - 1}
          >
            <svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
              <polyline points="9,18 15,12 9,6"></polyline>
            </svg>
          </button>
        </div>

        <p className="font-medium text-dark dark:text-white">
          Показано {Math.min(startIndex + 1, filteredProducts.length)} - {Math.min(startIndex + pageSize, filteredProducts.length)} из{" "}
          {filteredProducts.length} записей
          {globalFilter && ` (отфильтровано из ${products.length})`}
        </p>
      </div>
    </section>
  );
}

export function ProductsTable() {
  return (
    <>
      <Suspense fallback={
        <section className="data-table-common rounded-[10px] bg-white shadow-1 dark:bg-gray-dark dark:shadow-card">
          <div className="flex items-center justify-center py-16">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            <span className="ml-3 text-dark dark:text-white">Загрузка...</span>
          </div>
        </section>
      }>
        <ProductsTableContent />
      </Suspense>
      <FloatingCart />
    </>
  );
} 