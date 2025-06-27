'use client';

import { useState, useRef } from 'react';
import { IconComponent } from '@/components/webapp/IconComponent';
import { motion, AnimatePresence } from 'framer-motion';

interface PhotoUploaderProps {
  onPhotosChange: (photos: string[]) => void;
  maxPhotos?: number;
  disabled?: boolean;
}

interface UploadingPhoto {
  id: string;
  file: File;
  progress: number;
  url?: string;
  error?: string;
}

export function PhotoUploader({ 
  onPhotosChange, 
  maxPhotos = 3, 
  disabled = false 
}: PhotoUploaderProps) {
  const [photos, setPhotos] = useState<string[]>([]);
  const [uploadingPhotos, setUploadingPhotos] = useState<UploadingPhoto[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Haptic feedback
  const triggerHaptic = (type: 'light' | 'medium' | 'heavy' = 'medium') => {
    if (typeof window !== 'undefined' && 'vibrate' in navigator) {
      const patterns = {
        light: [10],
        medium: [20],
        heavy: [30]
      };
      navigator.vibrate(patterns[type]);
    }
  };

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    
    if (files.length === 0) return;

    // Проверяем лимит фотографий
    const totalPhotos = photos.length + uploadingPhotos.length + files.length;
    if (totalPhotos > maxPhotos) {
      triggerHaptic('heavy');
      alert(`Можно загрузить максимум ${maxPhotos} фотографии`);
      return;
    }

    // Проверяем размер файлов (максимум 5MB на файл)
    const maxSize = 5 * 1024 * 1024; // 5MB
    const oversizedFiles = files.filter(file => file.size > maxSize);
    if (oversizedFiles.length > 0) {
      triggerHaptic('heavy');
      alert('Размер файла не должен превышать 5MB');
      return;
    }

    // Проверяем типы файлов
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    const invalidFiles = files.filter(file => !allowedTypes.includes(file.type));
    if (invalidFiles.length > 0) {
      triggerHaptic('heavy');
      alert('Разрешены только файлы: JPG, PNG, WEBP');
      return;
    }

    triggerHaptic('light');

    // Создаем записи для загружаемых файлов
    const newUploadingPhotos: UploadingPhoto[] = files.map(file => ({
      id: Math.random().toString(36).substring(7),
      file,
      progress: 0
    }));

    setUploadingPhotos(prev => [...prev, ...newUploadingPhotos]);

    // Загружаем файлы
    for (const uploadingPhoto of newUploadingPhotos) {
      try {
        await uploadPhoto(uploadingPhoto);
      } catch (error) {
        console.error('Upload failed:', error);
      }
    }

    // Очищаем input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const uploadPhoto = async (uploadingPhoto: UploadingPhoto) => {
    try {
      // Обновляем прогресс
      updateUploadingPhoto(uploadingPhoto.id, { progress: 10 });

      // Получаем presigned URL
      const response = await fetch('/api/webapp/reviews/upload', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          fileName: uploadingPhoto.file.name,
          contentType: uploadingPhoto.file.type,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Ошибка получения URL для загрузки');
      }

      const { uploadUrl, fileUrl } = await response.json();
      updateUploadingPhoto(uploadingPhoto.id, { progress: 30 });

      // Загружаем файл в S3
      const uploadResponse = await fetch(uploadUrl, {
        method: 'PUT',
        body: uploadingPhoto.file,
        headers: {
          'Content-Type': uploadingPhoto.file.type,
        },
      });

      if (!uploadResponse.ok) {
        throw new Error('Ошибка загрузки файла');
      }

      updateUploadingPhoto(uploadingPhoto.id, { progress: 100, url: fileUrl });

      // Добавляем в список готовых фотографий
      const newPhotos = [...photos, fileUrl];
      setPhotos(newPhotos);
      onPhotosChange(newPhotos);

      // Удаляем из списка загружаемых
      setUploadingPhotos(prev => prev.filter(p => p.id !== uploadingPhoto.id));

      triggerHaptic('light');

    } catch (error) {
      console.error('Upload error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Ошибка загрузки';
      updateUploadingPhoto(uploadingPhoto.id, { 
        progress: 0, 
        error: errorMessage 
      });
      triggerHaptic('heavy');
    }
  };

  const updateUploadingPhoto = (id: string, updates: Partial<UploadingPhoto>) => {
    setUploadingPhotos(prev => 
      prev.map(photo => 
        photo.id === id ? { ...photo, ...updates } : photo
      )
    );
  };

  const removePhoto = (index: number) => {
    const newPhotos = photos.filter((_, i) => i !== index);
    setPhotos(newPhotos);
    onPhotosChange(newPhotos);
    triggerHaptic('medium');
  };

  const removeUploadingPhoto = (id: string) => {
    setUploadingPhotos(prev => prev.filter(p => p.id !== id));
    triggerHaptic('medium');
  };

  const handleDragEnter = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!disabled && canAddMore) setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    
    if (disabled || !canAddMore) return;
    
    const files = Array.from(e.dataTransfer.files);
    if (files.length === 0) return;
    
    const event = { target: { files: e.dataTransfer.files } } as unknown as React.ChangeEvent<HTMLInputElement>;
    handleFileSelect(event);
  };

  const canAddMore = photos.length + uploadingPhotos.length < maxPhotos;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <label className="text-sm font-medium text-gray-700">
          Фотографии
        </label>
        <span className="text-xs text-gray-500">
          {photos.length + uploadingPhotos.length} из {maxPhotos}
        </span>
      </div>

      {/* Drag & Drop зона */}
      <div
        className={`relative rounded-lg border-2 border-dashed p-4 transition-all duration-200 ease-in-out
          ${isDragging ? 'border-[#48C928] bg-[#48C928]/5' : 'border-gray-300'}
          ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer hover:border-[#48C928]'}`}
        onDragEnter={handleDragEnter}
        onDragOver={handleDragEnter}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => !disabled && canAddMore && fileInputRef.current?.click()}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/jpg,image/png,image/webp"
          multiple
          onChange={handleFileSelect}
          className="hidden"
          disabled={disabled || !canAddMore}
        />

        <div className="flex flex-col items-center justify-center gap-2 py-4">
          <IconComponent name="camera" size={32} className="text-gray-400" />
          <div className="text-sm text-center">
            <span className="font-medium text-[#48C928]">Выберите фото</span>
            {' '}или перетащите их сюда
          </div>
          <p className="text-xs text-gray-500">
            JPG, PNG или WEBP, до 5MB
          </p>
        </div>
      </div>

      {/* Сетка фотографий */}
      <div className="grid grid-cols-3 gap-4 mt-4">
        <AnimatePresence>
          {/* Загруженные фото */}
          {photos.map((photo, index) => (
            <motion.div
              key={photo}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              className="relative aspect-square rounded-lg overflow-hidden bg-gray-100"
            >
              <img
                src={photo}
                alt={`Фото ${index + 1}`}
                className="w-full h-full object-cover"
              />
              <button
                type="button"
                onClick={() => removePhoto(index)}
                disabled={disabled}
                className="absolute top-2 right-2 p-1 rounded-full bg-black/50 text-white hover:bg-black/70 transition-colors"
              >
                <IconComponent name="close" size={16} />
              </button>
            </motion.div>
          ))}

          {/* Загружаемые фото */}
          {uploadingPhotos.map((photo) => (
            <motion.div
              key={photo.id}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              className="relative aspect-square rounded-lg overflow-hidden bg-gray-100"
            >
              {photo.error ? (
                <div className="absolute inset-0 flex flex-col items-center justify-center p-2 bg-red-50">
                  <IconComponent name="error" size={24} className="text-red-500" />
                  <p className="text-xs text-red-500 text-center mt-2">{photo.error}</p>
                </div>
              ) : (
                <>
                  {photo.url ? (
                    <img src={photo.url} alt="Загруженное фото" className="w-full h-full object-cover" />
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="w-full max-w-[80%]">
                        <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                          <motion.div
                            className="h-full bg-[#48C928]"
                            initial={{ width: 0 }}
                            animate={{ width: `${photo.progress}%` }}
                            transition={{ duration: 0.3 }}
                          />
                        </div>
                      </div>
                    </div>
                  )}
                </>
              )}
              <button
                type="button"
                onClick={() => removeUploadingPhoto(photo.id)}
                disabled={disabled}
                className="absolute top-2 right-2 p-1 rounded-full bg-black/50 text-white hover:bg-black/70 transition-colors"
              >
                <IconComponent name="close" size={16} />
              </button>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
} 