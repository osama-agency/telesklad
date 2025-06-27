"use client";

import { useProductsWithSubscriptions } from '@/hooks/useProductsWithSubscriptions';

export default function TestCatalogSimplePage() {
  const { products, loading, error } = useProductsWithSubscriptions();

  console.log('TestCatalogSimple - loading:', loading, 'error:', error, 'products:', products.length);

  if (loading) {
    return <div className="p-4">Loading...</div>;
  }

  if (error) {
    return <div className="p-4 text-red-500">Error: {error}</div>;
  }

  return (
    <div className="p-4">
      <h1 className="text-xl font-bold mb-4">Простой тест каталога</h1>
      <p>Найдено товаров: {products.length}</p>
      
      <div className="grid grid-cols-2 gap-4 mt-4">
        {products.slice(0, 4).map((product) => (
          <div key={product.id} className="border p-4 rounded">
            <h3 className="font-medium">{product.name}</h3>
            <p className="text-green-600">{product.price} ₽</p>
            <p className="text-xs text-gray-500">ID: {product.id}</p>
            {product.image_url && (
              <img 
                src={product.image_url} 
                alt={product.name}
                className="w-16 h-16 object-contain mt-2"
                onError={(e) => {
                  console.error('Image error for', product.name, product.image_url);
                  e.currentTarget.style.display = 'none';
                }}
              />
            )}
          </div>
        ))}
      </div>
      
      <details className="mt-4">
        <summary>Все товары (JSON)</summary>
        <pre className="text-xs bg-gray-100 p-2 mt-2 overflow-auto">
          {JSON.stringify(products, null, 2)}
        </pre>
      </details>
    </div>
  );
} 