'use client'

import { useState } from 'react'
import { IconComponent } from '@/components/webapp/IconComponent'

interface ReviewFormProps {
  productId: number
  productName: string
  onSuccess?: () => void
  onCancel?: () => void
}

export function ReviewForm({ productId, productName, onSuccess, onCancel }: ReviewFormProps) {
  const [rating, setRating] = useState(0)
  const [content, setContent] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [hoverRating, setHoverRating] = useState(0)

  // Haptic feedback (только для мобильных устройств)
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!rating) {
      setError('Пожалуйста, выберите рейтинг')
      triggerHaptic('heavy')
      return
    }

    if (!content.trim() || content.length < 5) {
      setError('Отзыв должен содержать минимум 5 символов')
      triggerHaptic('heavy')
      return
    }

    if (content.length > 1000) {
      setError('Отзыв должен содержать максимум 1000 символов')
      triggerHaptic('heavy')
      return
    }

    setIsSubmitting(true)
    setError('')
    triggerHaptic('medium')

    try {
      const response = await fetch(`/api/webapp/products/${productId}/reviews`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          content: content.trim(),
          rating,
          tg_id: '9999' // В реальном приложении получать из контекста пользователя
        })
      })

      const data = await response.json()

      if (response.ok) {
        triggerHaptic('light')
        onSuccess?.()
      } else {
        setError(data.error || 'Произошла ошибка при отправке отзыва')
        triggerHaptic('heavy')
      }
    } catch (error) {
      console.error('Error submitting review:', error)
      setError('Произошла ошибка при отправке отзыва')
      triggerHaptic('heavy')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleRatingClick = (newRating: number) => {
    setRating(newRating)
    triggerHaptic('light')
  }

  const renderStars = () => {
    return (
      <div className="rating-stars">
        {[1, 2, 3, 4, 5].map((star) => (
          <span
            key={star}
            className={`${star <= (hoverRating || rating) ? 'filled-star' : ''}`}
            onClick={() => handleRatingClick(star)}
            onMouseEnter={() => setHoverRating(star)}
            onMouseLeave={() => setHoverRating(0)}
          >
            <IconComponent name="star" size={32} />
          </span>
        ))}
      </div>
    )
  }

  return (
    <div className="review-form-container">
      <div className="mt-4 title-review">
        <h2>Оставить отзыв</h2>
        <div className="flex font-medium mt-1 mb-5 text-[#48C928]">
          {productName}
        </div>
      </div>

      <form onSubmit={handleSubmit} className="profile-form">
        {/* Рейтинг */}
        <div className="input-container mt-4 !mb-4">
          <label className="text-center !mb-2">Рейтинг</label>
          {renderStars()}
        </div>

        {/* Текст отзыва */}
        <div className="input-container !mb-4">
          <label htmlFor="content">Отзыв</label>
          <textarea
            id="content"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            required
            className="input-str"
            rows={3}
            minLength={5}
            maxLength={1000}
            placeholder="Расскажите о своем опыте использования товара..."
          />
          <div className="text-xs text-gray-500 mt-1">
            {content.length}/1000 символов
          </div>
        </div>

        {/* Ошибка */}
        {error && (
          <div className="error-message mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
            {error}
          </div>
        )}

        {/* Кнопки */}
        <div className="mb-5 review-form-submit flex gap-3">
          {onCancel && (
            <button 
              type="button"
              onClick={onCancel}
              className="btn btn-secondary flex-1"
              disabled={isSubmitting}
            >
              Отмена
            </button>
          )}
          <button 
            type="submit"
            className={`btn btn-big flex-1 ${isSubmitting ? 'loading' : ''}`}
            disabled={isSubmitting || !rating || content.length < 5}
          >
            {isSubmitting ? 'Отправляем...' : 'Опубликовать'}
          </button>
        </div>

        {/* Информация о модерации */}
        <div className="text-xs text-gray-500 text-center mb-4">
          Отзыв будет опубликован после модерации
        </div>
      </form>
    </div>
  )
} 