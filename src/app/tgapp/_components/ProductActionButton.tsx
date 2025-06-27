"use client";

import { AddToCartButton } from './AddToCartButton';
import { SubscribeButton } from './SubscribeButton';

interface ProductActionButtonProps {
  productId: number;
  productName: string;
  productPrice: number;
  stockQuantity: number;
  maxQuantity?: number;
  imageUrl?: string;
  initiallySubscribed?: boolean;
  onCartChange?: (quantity: number) => void;
  className?: string;
}

export function ProductActionButton({
  productId,
  productName,
  productPrice,
  stockQuantity,
  maxQuantity,
  imageUrl,
  initiallySubscribed = false,
  onCartChange,
  className = ""
}: ProductActionButtonProps) {
  
  // Если товар в наличии - показываем кнопку "В корзину"
  if (stockQuantity > 0) {
    return (
      <AddToCartButton
        productId={productId}
        productName={productName}
        productPrice={productPrice}
        maxQuantity={Math.min(maxQuantity || 99, stockQuantity)}
        imageUrl={imageUrl}
        onCartChange={onCartChange}
      />
    );
  }
  
  // Если товара нет в наличии - показываем кнопку "Подписаться"
  return (
    <SubscribeButton
      productId={productId}
      initiallySubscribed={initiallySubscribed}
      className={className}
    />
  );
} 