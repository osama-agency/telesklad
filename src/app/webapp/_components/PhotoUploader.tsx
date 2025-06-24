'use client';

import { useState, useRef } from 'react';
import { IconComponent } from '@/components/webapp/IconComponent';

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

  const canAddMore = photos.length + uploadingPhotos.length < maxPhotos;

  return (
    <div className="photo-uploader">
      <label className="block text-sm font-medium mb-2">
        Фотографии (до {maxPhotos} шт.)
      </label>
      
      <div className="photo-grid">
        {/* Готовые фотографии */}
        {photos.map((photo, index) => (
          <div key={index} className="photo-item uploaded">
            <img src={photo} alt={`Фото ${index + 1}`} />
            <button
              type="button"
              onClick={() => removePhoto(index)}
              className="remove-photo-btn"
              disabled={disabled}
            >
              <IconComponent name="close" size={16} />
            </button>
          </div>
        ))}

        {/* Загружаемые фотографии */}
        {uploadingPhotos.map((uploadingPhoto) => (
          <div key={uploadingPhoto.id} className="photo-item uploading">
            <div className="upload-preview">
              <img 
                src={URL.createObjectURL(uploadingPhoto.file)} 
                alt="Загружается..." 
              />
              <div className="upload-overlay">
                {uploadingPhoto.error ? (
                  <div className="upload-error">
                    <IconComponent name="alert" size={20} />
                    <span className="error-text">{uploadingPhoto.error}</span>
                  </div>
                ) : (
                  <div className="upload-progress">
                    <div className="progress-circle">
                      <span>{uploadingPhoto.progress}%</span>
                    </div>
                  </div>
                )}
              </div>
            </div>
            <button
              type="button"
              onClick={() => removeUploadingPhoto(uploadingPhoto.id)}
              className="remove-photo-btn"
            >
              <IconComponent name="close" size={16} />
            </button>
          </div>
        ))}

        {/* Кнопка добавления */}
        {canAddMore && (
          <div className="photo-item add-photo">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/jpg,image/png,image/webp"
              multiple
              onChange={handleFileSelect}
              disabled={disabled}
              className="hidden"
            />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={disabled}
              className="add-photo-btn"
            >
              <IconComponent name="camera" size={24} />
              <span>Добавить фото</span>
            </button>
          </div>
        )}
      </div>

      {/* Подсказка */}
      <div className="text-xs text-gray-500 mt-2">
        Максимум {maxPhotos} фотографии, до 5MB каждая. Форматы: JPG, PNG, WEBP
      </div>
    </div>
  );
} 