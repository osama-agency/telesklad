import { useState, useEffect, useCallback } from 'react';

interface Review {
  id: string;
  user_id: string;
  product_id: string;
  content: string;
  rating: number;
  approved: boolean;
  created_at: string;
  updated_at: string;
  users: {
    id: string;
    first_name: string | null;
    last_name: string | null;
    username: string | null;
    photo_url: string | null;
  };
  products: {
    id: string;
    name: string | null;
  };
}

interface ReviewsResponse {
  reviews: Review[];
  pagination: {
    page: number;
    limit: number;
    totalCount: number;
    totalPages: number;
  };
  stats: {
    averageRating: number;
    totalReviews: number;
    ratingDistribution: Array<{ rating: number; count: number }>;
  };
}

interface UseReviewsOptions {
  page?: number;
  limit?: number;
  rating?: number | null;
  approved?: boolean | null;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export const useReviews = (options: UseReviewsOptions = {}) => {
  const [data, setData] = useState<ReviewsResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const {
    page = 1,
    limit = 10,
    rating = null,
    approved = null,
    sortBy = 'created_at',
    sortOrder = 'desc'
  } = options;

  const fetchReviews = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
        sortBy,
        sortOrder,
      });

      if (rating !== null) {
        params.append('rating', rating.toString());
      }

      if (approved !== null) {
        params.append('approved', approved.toString());
      }

      const response = await fetch(`/api/reviews?${params}`);
      
      if (!response.ok) {
        throw new Error('Ошибка при загрузке отзывов');
      }

      const result = await response.json();
      setData(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Произошла ошибка');
    } finally {
      setLoading(false);
    }
  }, [page, limit, rating, approved, sortBy, sortOrder]);

  useEffect(() => {
    fetchReviews();
  }, [page, limit, rating, approved, sortBy, sortOrder, fetchReviews]);

  const approveReview = async (reviewId: string, approved: boolean) => {
    try {
      const response = await fetch(`/api/reviews/${reviewId}/approve`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ approved }),
      });

      if (!response.ok) {
        throw new Error('Ошибка при обновлении отзыва');
      }

      // Обновляем данные после успешного изменения
      await fetchReviews();
      
      return true;
    } catch (err) {
      console.error('Ошибка при одобрении отзыва:', err);
      return false;
    }
  };

  const createReview = async (reviewData: {
    user_id: string;
    product_id: string;
    content: string;
    rating: number;
  }) => {
    try {
      const response = await fetch('/api/reviews', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(reviewData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Ошибка при создании отзыва');
      }

      const result = await response.json();
      
      // Обновляем данные после создания
      await fetchReviews();
      
      return result.review;
    } catch (err) {
      console.error('Ошибка при создании отзыва:', err);
      throw err;
    }
  };

  return {
    data,
    loading,
    error,
    refetch: fetchReviews,
    approveReview,
    createReview,
  };
}; 