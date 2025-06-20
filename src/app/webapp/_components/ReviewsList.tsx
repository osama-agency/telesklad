'use client'

import { useState, useEffect } from 'react'
import { IconComponent } from '@/components/webapp/IconComponent'

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
        <div className="text-center py-8 text-gray-500">
          <div className="mb-4">
            <IconComponent name="star" size={48} className="text-gray-300" />
          </div>
          <p className="font-medium mb-2">Пока нет отзывов на этот товар</p>
          <p className="text-sm">Будьте первым, кто оставит отзыв!</p>
        </div>
        <div className="text-center">
          <button 
            className="btn-new-review"
            onClick={onReviewCreate}
          >
            Оставить отзыв
          </button>
        </div>
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
              {review.photos.length > 0 && (
                <div className="img-block">
                  {review.photos.map((photo, index) => (
                    <div 
                      key={index}
                      className="review-photo"
                      style={{ 
                        backgroundImage: `url('${photo}')`, 
                        backgroundSize: 'cover',
                        backgroundPosition: 'center'
                      }}
                    />
                  ))}
                </div>
              )}
              
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