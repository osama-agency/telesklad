'use client'

import { useState, useEffect } from 'react'
import { IconComponent } from '@/components/webapp/IconComponent'
import { ReviewPhotos } from './ReviewPhotos'

interface Review {
  id: number
  content: string
  rating: number
  created_at: string
  user: {
    id: number
    first_name?: string
    last_name?: string
    username?: string
    photo_url?: string
    display_name: string
  }
  photos: string[]
}

interface ReviewStatistics {
  total_count: number
  average_rating: number
  rating_distribution: {
    rating: number
    count: number
    percentage: number
  }[]
}

interface ReviewsData {
  reviews: Review[]
  statistics: ReviewStatistics
}

interface ReviewsListProps {
  productId: number
  onReviewCreate?: () => void
}

export function ReviewsList({ productId, onReviewCreate }: ReviewsListProps) {
  const [reviewsData, setReviewsData] = useState<ReviewsData | null>(null)
  const [loading, setLoading] = useState(true)
  const [showAll, setShowAll] = useState(false)

  useEffect(() => {
    fetchReviews()
  }, [productId])

  const fetchReviews = async () => {
    try {
      const response = await fetch(`/api/webapp/products/${productId}/reviews`)
      if (response.ok) {
        const data = await response.json()
        setReviewsData(data)
      }
    } catch (error) {
      console.error('Error fetching reviews:', error)
    } finally {
      setLoading(false)
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('ru-RU', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    })
  }

  const renderStars = (rating: number, size: number = 12) => {
    return (
      <div className="stars">
        {[1, 2, 3, 4, 5].map((star) => (
          <span 
            key={star} 
            className={star <= rating ? 'filled-star' : ''}
          >
            <IconComponent name="star" size={size} />
          </span>
        ))}
      </div>
    )
  }

  const renderAvatar = (user: Review['user']) => {
    if (user.photo_url) {
      return (
        <img 
          src={user.photo_url} 
          alt={user.display_name}
          className="w-10 h-10 rounded-full object-cover"
        />
      )
    }
    
    // Аватар по умолчанию с первой буквой имени
    const initial = user.display_name.charAt(0).toUpperCase()
    return (
      <div className="profile-avatar w-10 h-10 rounded-full flex items-center justify-center text-white font-semibold">
        {initial}
      </div>
    )
  }

  if (loading) {
    return (
      <div className="card-block">
        <div className="title-card">Отзывы</div>
        <div className="flex justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#48C928]"></div>
        </div>
      </div>
    )
  }

  if (!reviewsData || reviewsData.reviews.length === 0) {
    return (
      <div className="card-block">
        <div className="title-card">Отзывы</div>
        
        {/* Современная заглушка для пустого состояния */}
        <div className="empty-reviews-state">
          {/* Градиентный фон */}
          <div className="empty-reviews-background">
            <div className="gradient-circle gradient-circle-1"></div>
            <div className="gradient-circle gradient-circle-2"></div>
            <div className="gradient-circle gradient-circle-3"></div>
          </div>
          
          {/* Иконка */}
          <div className="empty-reviews-icon">
            <div className="star-container">
              <IconComponent name="star" size={32} />
              <IconComponent name="star" size={28} />
              <IconComponent name="star" size={24} />
            </div>
          </div>
          
          {/* Текст */}
          <div className="empty-reviews-content">
            <h3 className="empty-reviews-title">Пока нет отзывов</h3>
            <p className="empty-reviews-description">
              Станьте первым, кто поделится впечатлениями о товаре. 
              Ваш отзыв поможет другим покупателям!
            </p>
          </div>
          
          {/* Кнопка */}
          <button 
            className="empty-reviews-button"
            onClick={onReviewCreate}
          >
            <span className="button-icon">✨</span>
            Написать первый отзыв
          </button>
        </div>

        <style jsx>{`
          .empty-reviews-state {
            position: relative;
            text-align: center;
            padding: 48px 24px;
            overflow: hidden;
            border-radius: 20px;
            background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
            margin: 16px 0;
          }

          .empty-reviews-background {
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            pointer-events: none;
          }

          .gradient-circle {
            position: absolute;
            border-radius: 50%;
            opacity: 0.1;
            animation: float 6s ease-in-out infinite;
          }

          .gradient-circle-1 {
            width: 120px;
            height: 120px;
            background: linear-gradient(135deg, #48C928, #3AA120);
            top: -60px;
            right: -60px;
            animation-delay: 0s;
          }

          .gradient-circle-2 {
            width: 80px;
            height: 80px;
            background: linear-gradient(135deg, #FFD700, #FFA500);
            bottom: -40px;
            left: -40px;
            animation-delay: 2s;
          }

          .gradient-circle-3 {
            width: 60px;
            height: 60px;
            background: linear-gradient(135deg, #FF6B6B, #FF8E8E);
            top: 20px;
            left: 20px;
            animation-delay: 4s;
          }

          .empty-reviews-icon {
            position: relative;
            z-index: 1;
            margin-bottom: 24px;
          }

          .star-container {
            position: relative;
            display: inline-block;
            padding: 20px;
            background: white;
            border-radius: 20px;
            box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
            border: 1px solid rgba(72, 201, 40, 0.1);
          }

          .star-container :global(.icon) {
            color: #FFD700;
            filter: drop-shadow(0 2px 4px rgba(255, 215, 0, 0.3));
          }

          .star-container :global(.icon):nth-child(1) {
            margin-right: 4px;
            animation: sparkle 2s ease-in-out infinite;
          }

          .star-container :global(.icon):nth-child(2) {
            margin-right: 4px;
            animation: sparkle 2s ease-in-out infinite 0.3s;
          }

          .star-container :global(.icon):nth-child(3) {
            animation: sparkle 2s ease-in-out infinite 0.6s;
          }

          .empty-reviews-content {
            position: relative;
            z-index: 1;
            margin-bottom: 32px;
          }

          .empty-reviews-title {
            font-size: 20px;
            font-weight: 700;
            color: #1e293b;
            margin-bottom: 12px;
            letter-spacing: -0.025em;
          }

          .empty-reviews-description {
            font-size: 15px;
            color: #64748b;
            line-height: 1.6;
            max-width: 320px;
            margin: 0 auto;
          }

          .empty-reviews-button {
            position: relative;
            z-index: 1;
            display: inline-flex;
            align-items: center;
            gap: 8px;
            background: linear-gradient(135deg, #48C928 0%, #3AA120 100%);
            color: white;
            font-weight: 600;
            font-size: 16px;
            padding: 16px 32px;
            border-radius: 16px;
            border: none;
            cursor: pointer;
            transition: all 0.3s ease;
            box-shadow: 0 8px 25px rgba(72, 201, 40, 0.3);
          }

          .empty-reviews-button:hover {
            transform: translateY(-2px);
            box-shadow: 0 12px 35px rgba(72, 201, 40, 0.4);
          }

          .empty-reviews-button:active {
            transform: translateY(0px);
          }

          .button-icon {
            font-size: 18px;
            animation: pulse 2s ease-in-out infinite;
          }

          @keyframes float {
            0%, 100% {
              transform: translateY(0px) rotate(0deg);
            }
            50% {
              transform: translateY(-20px) rotate(180deg);
            }
          }

          @keyframes sparkle {
            0%, 100% {
              transform: scale(1) rotate(0deg);
              opacity: 1;
            }
            50% {
              transform: scale(1.2) rotate(72deg);
              opacity: 0.8;
            }
          }

          @keyframes pulse {
            0%, 100% {
              transform: scale(1);
            }
            50% {
              transform: scale(1.1);
            }
          }
        `}</style>
      </div>
    )
  }

  const { reviews, statistics } = reviewsData
  const displayedReviews = showAll ? reviews : reviews.slice(0, 3)

  return (
    <div className="card-block">
      {/* Header с статистикой */}
      <div className="product-reviews">
        <div className="reviews-header">
          <div className="average-rating">
            <span className="rating-number">{statistics.average_rating}</span>
            <div className="rating-stars-display">
              {renderStars(Math.round(statistics.average_rating), 28)}
            </div>
          </div>
          <div className="counter">
            {statistics.total_count} {getReviewCountText(statistics.total_count)}
          </div>
          <button 
            className="btn-new-review"
            onClick={onReviewCreate}
          >
            Оставить отзыв
          </button>
        </div>
        
        {/* Процентное соотношение рейтингов */}
        <div className="percentages">
          {statistics.rating_distribution.map((item) => (
            <div key={item.rating} className="percentage-wrap">
              <div className="rating">{item.rating}</div>
              <div className="percentage">
                <div style={{ width: `${item.percentage}%` }}></div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Список отзывов */}
      <div className="reviews-list">
        {displayedReviews.map((review) => (
          <div key={review.id} className="review">
            <div className="avatar">
              {renderAvatar(review.user)}
            </div>

            <div className="review-body">
              <div className="font-semibold mb-1">{review.user.display_name}</div>
              {renderStars(review.rating, 12)}
              <div className="mb-2">{review.content}</div>
              
              {/* Фотографии отзыва */}
              <ReviewPhotos photos={review.photos} reviewId={review.id} />
              
              <div className="text-xs text-gray-500 mt-2">
                {formatDate(review.created_at)}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Кнопка "Показать все отзывы" */}
      {reviews.length > 3 && (
        <button 
          className="mt-5 btn btn-secondary btn-big w-full"
          onClick={() => setShowAll(!showAll)}
        >
          {showAll ? 'Скрыть отзывы' : 'Смотреть все отзывы'}
        </button>
      )}
    </div>
  )
}

function getReviewCountText(count: number): string {
  if (count % 10 === 1 && count % 100 !== 11) {
    return 'отзыв'
  } else if ([2, 3, 4].includes(count % 10) && ![12, 13, 14].includes(count % 100)) {
    return 'отзыва'
  } else {
    return 'отзывов'
  }
} 