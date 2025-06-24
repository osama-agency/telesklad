'use client';

import { useState } from 'react';
import { IconComponent } from '@/components/webapp/IconComponent';

interface ReviewPhotosProps {
  photos: string[];
  reviewId: number;
}

export function ReviewPhotos({ photos, reviewId }: ReviewPhotosProps) {
  const [selectedPhoto, setSelectedPhoto] = useState<string | null>(null);

  if (!photos || photos.length === 0) {
    return null;
  }

  const openPhoto = (photo: string) => {
    setSelectedPhoto(photo);
  };

  const closePhoto = () => {
    setSelectedPhoto(null);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      closePhoto();
    }
  };

  return (
    <>
      <div className="review-photos">
        <div className="photos-grid">
          {photos.map((photo, index) => (
            <div
              key={index}
              className="photo-thumbnail"
              onClick={() => openPhoto(photo)}
            >
              <img
                src={photo}
                alt={`Фото к отзыву ${index + 1}`}
                loading="lazy"
              />
              <div className="photo-overlay">
                <IconComponent name="search" size={20} />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Модальное окно для просмотра фото */}
      {selectedPhoto && (
        <div
          className="photo-modal"
          onClick={closePhoto}
          onKeyDown={handleKeyDown}
          tabIndex={0}
          role="dialog"
          aria-label="Просмотр фотографии"
        >
          <div className="photo-modal-content" onClick={(e) => e.stopPropagation()}>
            <button
              className="photo-modal-close"
              onClick={closePhoto}
              aria-label="Закрыть"
            >
              <IconComponent name="close" size={24} />
            </button>
            <img
              src={selectedPhoto}
              alt="Фотография в полном размере"
              className="photo-modal-image"
            />
          </div>
        </div>
      )}
    </>
  );
} 