"use client";

import { useState, useEffect } from 'react';

export default function TestApiPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch('/api/webapp/products?tg_id=9999');
        const result = await response.json();
        setData(result);
      } catch (error) {
        console.error('Error:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) return <div>Loading...</div>;

  const attexProducts = data?.products?.filter((p: any) => p.name.includes('Attex')) || [];

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Тест API</h1>
      
      <h2 className="text-lg font-semibold mb-2">Товары Attex:</h2>
      
      {attexProducts.map((product: any) => (
        <div key={product.id} className="border p-4 mb-2 rounded">
          <h3 className="font-medium">{product.name}</h3>
          <p className="text-sm text-gray-600">ID: {product.id}</p>
          <p className="text-sm break-all">
            Изображение: {product.image_url || 'Нет изображения'}
          </p>
          {product.image_url && (
            <img 
              src={product.image_url} 
              alt={product.name}
              className="w-32 h-32 object-contain mt-2 border"
              onError={(e) => {
                console.error('Image load error:', product.image_url);
                e.currentTarget.style.display = 'none';
              }}
            />
          )}
        </div>
      ))}
      
      <details className="mt-4">
        <summary className="cursor-pointer font-semibold">Полные данные API</summary>
        <pre className="mt-2 p-2 bg-gray-100 text-xs overflow-auto">
          {JSON.stringify(data, null, 2)}
        </pre>
      </details>
    </div>
  );
} 