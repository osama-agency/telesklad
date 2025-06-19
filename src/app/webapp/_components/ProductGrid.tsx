"use client";

import Link from "next/link";
import Image from "next/image";
import { IconComponent } from "@/components/webapp/IconComponent";
import { AddToCartButton } from "./AddToCartButton";

interface Product {
  id: number;
  name: string;
  price: number;
  old_price?: number;
  stock_quantity: number;
  image_url?: string;
  ancestry?: string;
}

interface ProductGridProps {
  products: Product[];
  onAddToCart?: () => void;
}

export function ProductGrid({ products, onAddToCart }: ProductGridProps) {
  return (
    <div className="product-grid" id="products">
      {products.map((product) => (
        <ProductCard key={product.id} product={product} onAddToCart={onAddToCart} />
      ))}
    </div>
  );
}

interface ProductCardProps {
  product: Product;
  onAddToCart?: () => void;
}

function ProductCard({ product, onAddToCart }: ProductCardProps) {
  const hasStock = product.stock_quantity > 0;

  // Обработчик изменения количества в корзине
  const handleCartChange = (quantity: number) => {
    if (quantity > 0) {
      // Показываем плашку корзины при добавлении
      onAddToCart?.();
    }
  };

  return (
    <div className="product-card">
      <div className={`product-wrapper ${!hasStock ? 'out-of-stock' : ''}`}>
        {/* Кнопка избранного - как в Rails */}
        <div className="absolute right-3 top-3 z-10">
          <button className="fav-btn">
            <IconComponent name="unfavorite" size={20} />
          </button>
        </div>

        {/* Индикатор "нет в наличии" */}
        {!hasStock && (
          <div className="absolute left-3 top-3 z-10">
            <div className="out-of-stock-badge">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2C6.47 2 2 6.47 2 12s4.47 10 10 10 10-4.47 10-10S17.53 2 12 2zm5 13.59L15.59 17 12 13.41 8.41 17 7 15.59 10.59 12 7 8.41 8.41 7 12 10.59 15.59 7 17 8.41 13.41 12 17 15.59z"/>
              </svg>
            </div>
          </div>
        )}

        {/* Product Image - точно как в Rails */}
        <div className="product-img">
          <Link href={`/webapp/products/${product.id}`} title={product.name}>
            <div className="relative">
              <div className="flex justify-center space-y-8 animate-pulse md:space-y-0 md:space-x-8 rtl:space-x-reverse md:flex md:items-center">
                <div className="flex items-center justify-center w-full h-48">
                  <IconComponent name="no-image" size={40} />
                </div>
              </div>
              {product.image_url && (
                <div className="absolute left-0 top-0 block w-full h-full">
                  <div className="flex justify-center items-center h-full">
                    <Image
                      src={product.image_url}
                      alt={product.name}
                      width={196}
                      height={196}
                      loading="lazy"
                    />
                  </div>
                </div>
              )}
            </div>
          </Link>
        </div>

        {/* Product Title - точно как в Rails */}
        <div className="product-title">
          <Link href={`/webapp/products/${product.id}`} title={product.name}>
            {product.name}
          </Link>
        </div>

        {/* Product Footer - точно как в Rails */}
        <div className="product-footer">
          {hasStock ? (
            <>
              {product.old_price ? (
                <div className="flex gap-1 items-center">
                  <div className="price">{Math.floor(product.price)}₽</div>
                  <div className="old-price">{Math.floor(product.old_price)}₽</div>
                </div>
              ) : (
                <div className="price-without-old">{Math.floor(product.price)}₽</div>
              )}
              {/* Современная кнопка добавления в корзину 2025 */}
              <AddToCartButton
                productId={product.id}
                productName={product.name}
                productPrice={product.price}
                maxQuantity={product.stock_quantity}
                onCartChange={handleCartChange}
              />
            </>
          ) : (
            <>
              {/* Показываем цену даже для товаров не в наличии */}
              {product.old_price ? (
                <div className="flex gap-1 items-center">
                  <div className="price-unavailable">{Math.floor(product.price)}₽</div>
                  <div className="old-price">{Math.floor(product.old_price)}₽</div>
                </div>
              ) : (
                <div className="price-unavailable-without-old">{Math.floor(product.price)}₽</div>
              )}
              <div className="title-has">Нет в наличии</div>
              <button className="webapp-btn-secondary">
                Уведомить о поступлении
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
} 