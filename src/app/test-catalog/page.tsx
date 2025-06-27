"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';

interface Product {
  id: number;
  name: string;
  price: number;
  stock_quantity: number;
  image_url?: string;
  isSubscribed: boolean;
}

export default function TestCatalogPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const response = await fetch('/api/webapp/products?tg_id=9999');
        
        if (!response.ok) {
          throw new Error('Failed to fetch products');
        }
        
        const data = await response.json();
        console.log('Fetched products:', data);
        
        setProducts(data.products || []);
      } catch (err) {
        console.error('Error fetching products:', err);
        setError(err instanceof Error ? err.message : 'Unknown error');
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  if (loading) {
    return <div className="p-4">Загрузка товаров...</div>;
  }

  if (error) {
    return <div className="p-4 text-red-500">Ошибка: {error}</div>;
  }

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Тестовый каталог</h1>
      <div className="grid grid-cols-2 gap-4">
        {products.map((product) => (
          <div key={product.id} className="border rounded-lg p-4 bg-white">
            <div className="mb-2">
              {product.image_url ? (
                <img
                  src={product.image_url}
                  alt={product.name}
                  className="w-full h-32 object-contain bg-gray-100 rounded"
                  onLoad={() => console.log('✅ Image loaded:', product.name)}
                  onError={(e) => {
                    console.error('❌ Image error:', product.name, product.image_url);
                    const target = e.currentTarget as HTMLImageElement;
                    target.style.display = 'none';
                  }}
                />
              ) : (
                <div className="w-full h-32 bg-gray-200 rounded flex items-center justify-center">
                  No Image
                </div>
              )}
            </div>
            <h3 className="font-medium text-sm mb-2">{product.name}</h3>
            <p className="text-green-600 font-bold">{product.price.toLocaleString('ru-RU')} ₽</p>
            <p className="text-xs text-gray-500">В наличии: {product.stock_quantity}</p>
          </div>
        ))}
      </div>
    </div>
  );
} 