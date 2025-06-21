"use client";

import { useState, useCallback, memo } from "react";
import { IconComponent } from "@/components/webapp/IconComponent";

interface OptimizedImageProps {
  src?: string;
  alt: string;
  width?: number;
  height?: number;
  className?: string;
  placeholder?: boolean;
  priority?: boolean; // Для изображений above the fold
}

export const OptimizedImage = memo(function OptimizedImage({
  src,
  alt,
  width = 172,
  height = 172,
  className = "",
  placeholder = true,
  priority = false
}: OptimizedImageProps) {
  const [imageLoading, setImageLoading] = useState(!!src);
  const [imageError, setImageError] = useState(false);
  const [imageSrc, setImageSrc] = useState<string | undefined>(src);

  const handleImageLoad = useCallback(() => {
    setImageLoading(false);
  }, []);

  const handleImageError = useCallback(() => {
    setImageError(true);
    setImageLoading(false);
    setImageSrc(undefined);
  }, []);

  // Генерируем оптимизированный URL для изображения
  const getOptimizedImageUrl = useCallback((url: string) => {
    // Если изображение уже оптимизировано или это внешний URL, возвращаем как есть
    if (url.includes('?') || !url.includes('strattera.tgapp.online')) {
      return url;
    }
    
    // Добавляем параметры для оптимизации
    const params = new URLSearchParams({
      w: width.toString(),
      h: height.toString(),
      q: '85', // Качество 85%
      f: 'webp' // Формат WebP для поддерживающих браузеров
    });
    
    return `${url}?${params.toString()}`;
  }, [width, height]);

  // Если нет изображения или произошла ошибка
  if (!imageSrc || imageError) {
    return (
      <div 
        className={`flex items-center justify-center bg-gray-100 ${className}`}
        style={{ width, height }}
      >
        <IconComponent name="no-image" size={Math.min(width, height) * 0.3} />
        {imageError && (
          <div className="absolute bottom-1 right-1 text-xs text-red-500">
            Error
          </div>
        )}
      </div>
    );
  }

  const optimizedSrc = getOptimizedImageUrl(imageSrc);

  return (
    <div className={`relative ${className}`} style={{ width, height }}>
      {/* Placeholder пока изображение загружается */}
      {imageLoading && placeholder && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100 animate-pulse">
          <IconComponent name="no-image" size={Math.min(width, height) * 0.25} />
        </div>
      )}
      
      {/* Основное изображение */}
      <img
        src={optimizedSrc}
        alt={alt}
        width={width}
        height={height}
        className={`transition-opacity duration-300 object-contain object-center rounded-lg ${
          imageLoading ? 'opacity-0' : 'opacity-100'
        }`}
        loading={priority ? 'eager' : 'lazy'}
        decoding="async"
        onLoad={handleImageLoad}
        onError={handleImageError}
        style={{
          maxWidth: '100%',
          maxHeight: '100%',
          width: '100%',
          height: '100%'
        }}
      />
      
      {/* Индикатор загрузки для критических изображений */}
      {priority && imageLoading && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-6 h-6 border-2 border-gray-300 border-t-green-500 rounded-full animate-spin"></div>
        </div>
      )}
    </div>
  );
}); 