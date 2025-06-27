"use client";

import { useState, useEffect } from 'react';

const testImages = [
  {
    name: "Abilify 15mg",
    url: "https://s3.ru1.storage.beget.cloud/2c11548b454d-eldar-agency/products/1751037166636-1751037166636-abilify-15mg.svg"
  },
  {
    name: "Abilify 30mg", 
    url: "https://s3.ru1.storage.beget.cloud/2c11548b454d-eldar-agency/products/1751037168425-1751037168425-abilify-15mg.svg"
  },
  {
    name: "Atominex 18mg",
    url: "https://s3.ru1.storage.beget.cloud/2c11548b454d-eldar-agency/products/1751037173606-1751037173606-atominex-18mg.svg"
  },
  {
    name: "Attex 40mg",
    url: "https://s3.ru1.storage.beget.cloud/2c11548b454d-eldar-agency/products/1751037180160-1751037180160-attex-40mg.svg"
  },
  {
    name: "Attex 40mg (Реальное изображение)",
    url: "https://s3.ru1.storage.beget.cloud/2c11548b454d-eldar-agency/products/1751022899083-1751022899083-0lxzgn.webp"
  }
];

export default function TestS3ImagesPage() {
  const [imageStatus, setImageStatus] = useState<{[key: string]: 'loading' | 'loaded' | 'error'}>({});

  useEffect(() => {
    // Инициализируем статус всех изображений как загружающиеся
    const initialStatus: {[key: string]: 'loading' | 'loaded' | 'error'} = {};
    testImages.forEach(img => {
      initialStatus[img.url] = 'loading';
    });
    setImageStatus(initialStatus);
  }, []);

  const handleImageLoad = (url: string) => {
    console.log('✅ Image loaded:', url);
    setImageStatus(prev => ({ ...prev, [url]: 'loaded' }));
  };

  const handleImageError = (url: string, error: any) => {
    console.error('❌ Image error:', url, error);
    setImageStatus(prev => ({ ...prev, [url]: 'error' }));
  };

  return (
    <div className="p-4 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Тест S3 изображений</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {testImages.map((image, index) => (
          <div key={index} className="border rounded-lg p-4 bg-white">
            <h3 className="font-medium mb-2">{image.name}</h3>
            
            <div className="mb-2 h-48 bg-gray-100 rounded flex items-center justify-center relative">
              {imageStatus[image.url] === 'loading' && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                </div>
              )}
              
              <img
                src={image.url}
                alt={image.name}
                className={`max-w-full max-h-full object-contain transition-opacity duration-300 ${
                  imageStatus[image.url] === 'loaded' ? 'opacity-100' : 'opacity-0'
                }`}
                onLoad={() => handleImageLoad(image.url)}
                onError={(e) => handleImageError(image.url, e)}
              />
              
              {imageStatus[image.url] === 'error' && (
                <div className="absolute inset-0 flex items-center justify-center bg-red-50">
                  <div className="text-red-500 text-center">
                    <div className="text-4xl mb-2">❌</div>
                    <div className="text-sm">Ошибка загрузки</div>
                  </div>
                </div>
              )}
            </div>
            
            <div className="text-xs space-y-1">
              <div className={`px-2 py-1 rounded text-white text-center ${
                imageStatus[image.url] === 'loaded' ? 'bg-green-500' : 
                imageStatus[image.url] === 'error' ? 'bg-red-500' : 'bg-blue-500'
              }`}>
                {imageStatus[image.url] === 'loaded' ? '✅ Загружено' :
                 imageStatus[image.url] === 'error' ? '❌ Ошибка' : '⏳ Загружается'}
              </div>
              <div className="text-gray-500 break-all">
                {image.url}
              </div>
            </div>
            
            <button 
              onClick={() => window.open(image.url, '_blank')}
              className="mt-2 w-full px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 text-sm"
            >
              Открыть в новой вкладке
            </button>
          </div>
        ))}
      </div>
      
      <div className="mt-6 p-4 bg-gray-100 rounded">
        <h2 className="font-bold mb-2">Инструкции по отладке:</h2>
        <ol className="list-decimal list-inside space-y-1 text-sm">
          <li>Откройте Developer Tools (F12)</li>
          <li>Перейдите на вкладку Console</li>
          <li>Перейдите на вкладку Network</li>
          <li>Обновите страницу</li>
          <li>Посмотрите на ошибки в консоли и сетевые запросы</li>
        </ol>
      </div>
    </div>
  );
} 