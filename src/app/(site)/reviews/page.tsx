"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";

import { useReviews } from "@/hooks/useReviews";

const StarRating = ({ rating }: { rating: number }) => {
  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <svg
          key={star}
          className={`w-4 h-4 ${
            star <= rating ? "text-yellow-400 fill-current" : "text-gray-300"
          }`}
          viewBox="0 0 20 20"
        >
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      ))}
    </div>
  );
};

export default function ReviewsPage() {
  const [filterRating, setFilterRating] = useState<number | null>(null);
  const [filterApproved, setFilterApproved] = useState<boolean | null>(null);
  const [sortBy, setSortBy] = useState<"created_at" | "rating">("created_at");
  const [page, setPage] = useState(1);

  const { data, loading, error, approveReview, refetch } = useReviews({
    page,
    limit: 10,
    rating: filterRating,
    approved: filterApproved,
    sortBy,
    sortOrder: "desc"
  });

  // Set document title
  useEffect(() => {
    document.title = "Отзывы | NextAdmin - Next.js Dashboard Kit";
  }, []);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ru-RU', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getCustomerName = (user: any) => {
    if (user.first_name && user.last_name) {
      return `${user.first_name} ${user.last_name}`;
    }
    return user.username || `Пользователь ${user.id}`;
  };

  const handleApproveReview = async (reviewId: string, approved: boolean) => {
    const success = await approveReview(reviewId, approved);
    if (success) {
      // Показать уведомление об успехе
      console.log(`Отзыв ${approved ? 'одобрен' : 'отклонен'}`);
    } else {
      // Показать уведомление об ошибке
      console.error('Ошибка при изменении статуса отзыва');
    }
  };

  if (loading && !data) {
    return (
      <div className="min-h-screen bg-main">
        <div className="mx-auto max-w-screen-xl xl:max-w-[90vw] 2xl:max-w-[95vw] p-4 md:p-6 2xl:p-10">
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-[#1A6DFF] border-t-transparent"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-main">
        <div className="mx-auto max-w-screen-xl xl:max-w-[90vw] 2xl:max-w-[95vw] p-4 md:p-6 2xl:p-10">
          <div className="text-center py-12">
            <div className="w-16 h-16 mx-auto mb-4 bg-red-100 dark:bg-red-900 rounded-full flex items-center justify-center">
              <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-[#1E293B] dark:text-white mb-2">
              Ошибка загрузки
            </h3>
            <p className="text-[#64748B] dark:text-gray-400 mb-4">{error}</p>
            <button 
              onClick={refetch}
              className="bg-gradient-to-r from-[#1A6DFF] to-[#00C5FF] text-white px-4 py-2 rounded-lg hover:scale-105 transition-all"
            >
              Попробовать снова
            </button>
          </div>
        </div>
      </div>
    );
  }

  const reviews = data?.reviews || [];
  const stats = data?.stats || { averageRating: 0, totalReviews: 0, ratingDistribution: [] };
  const pagination = data?.pagination || { page: 1, totalPages: 1, totalCount: 0 };

  return (
    <div className="min-h-screen bg-main">
      <div className="mx-auto max-w-screen-xl xl:max-w-[90vw] 2xl:max-w-[95vw] p-4 md:p-6 2xl:p-10">
        {/* Статистика */}
        <div className="mb-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            {/* Общая статистика */}
            <div className="bg-container rounded-xl p-6 border border-gray-200 dark:border-gray-700 hover:border-[#1A6DFF]/30 transition-all duration-300">
              <div className="text-center">
                <div className="text-3xl font-bold text-[#1A6DFF] mb-2">
                  {stats.averageRating.toFixed(1)}
                </div>
                <StarRating rating={Math.round(stats.averageRating)} />
                <div className="text-sm text-[#64748B] dark:text-gray-400 mt-2">
                  Средняя оценка из {stats.totalReviews} отзывов
                </div>
              </div>
            </div>

            {/* Распределение оценок */}
            <div className="bg-container rounded-xl p-6 border border-gray-200 dark:border-gray-700 hover:border-[#1A6DFF]/30 transition-all duration-300">
              <h3 className="text-lg font-semibold text-[#1E293B] dark:text-white mb-4">
                Распределение оценок
              </h3>
              <div className="space-y-2">
                {stats.ratingDistribution.map(({ rating, count }) => (
                  <div key={rating} className="flex items-center gap-2">
                    <span className="text-sm text-[#64748B] dark:text-gray-400 w-4">
                      {rating}
                    </span>
                    <div className="flex-1 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                      <div 
                        className="bg-[#1A6DFF] h-2 rounded-full transition-all duration-300"
                        style={{ 
                          width: `${stats.totalReviews > 0 ? (count / stats.totalReviews) * 100 : 0}%` 
                        }}
                      />
                    </div>
                    <span className="text-sm text-[#64748B] dark:text-gray-400 w-8">
                      {count}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Фильтры */}
            <div className="bg-container rounded-xl p-6 border border-gray-200 dark:border-gray-700 hover:border-[#1A6DFF]/30 transition-all duration-300">
              <h3 className="text-lg font-semibold text-[#1E293B] dark:text-white mb-4">
                Фильтры
              </h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-[#1E293B] dark:text-white mb-2">
                    Оценка
                  </label>
                  <select
                    value={filterRating || ""}
                    onChange={(e) => setFilterRating(e.target.value ? Number(e.target.value) : null)}
                    className="w-full rounded-lg border border-gray-200 dark:border-gray-600 bg-transparent px-3 py-2 text-sm text-[#1E293B] dark:text-white"
                  >
                    <option value="">Все оценки</option>
                    <option value="5">5 звезд</option>
                    <option value="4">4 звезды</option>
                    <option value="3">3 звезды</option>
                    <option value="2">2 звезды</option>
                    <option value="1">1 звезда</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-[#1E293B] dark:text-white mb-2">
                    Статус
                  </label>
                  <select
                    value={filterApproved === null ? "" : filterApproved.toString()}
                    onChange={(e) => {
                      const value = e.target.value;
                      setFilterApproved(value === "" ? null : value === "true");
                    }}
                    className="w-full rounded-lg border border-gray-200 dark:border-gray-600 bg-transparent px-3 py-2 text-sm text-[#1E293B] dark:text-white"
                  >
                    <option value="">Все отзывы</option>
                    <option value="true">Одобренные</option>
                    <option value="false">На модерации</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-[#1E293B] dark:text-white mb-2">
                    Сортировка
                  </label>
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value as "created_at" | "rating")}
                    className="w-full rounded-lg border border-gray-200 dark:border-gray-600 bg-transparent px-3 py-2 text-sm text-[#1E293B] dark:text-white"
                  >
                    <option value="created_at">По дате</option>
                    <option value="rating">По оценке</option>
                  </select>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Список отзывов */}
        <div className="space-y-4">
          {reviews.map((review, index) => (
            <motion.div
              key={review.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1, duration: 0.3 }}
              className="bg-container rounded-xl p-6 border border-gray-200 dark:border-gray-700 hover:border-[#1A6DFF]/30 transition-all duration-300"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-gradient-to-r from-[#1A6DFF] to-[#00C5FF] rounded-full flex items-center justify-center text-white font-semibold">
                    {getCustomerName(review.users).charAt(0)}
                  </div>
                  <div>
                    <h3 className="font-semibold text-[#1E293B] dark:text-white flex items-center gap-2">
                      {getCustomerName(review.users)}
                      {review.approved ? (
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                          <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                          </svg>
                          Одобрен
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200">
                          <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                          </svg>
                          На модерации
                        </span>
                      )}
                    </h3>
                    <div className="flex items-center gap-2 mt-1">
                      <StarRating rating={review.rating} />
                      <span className="text-sm text-[#64748B] dark:text-gray-400">
                        {formatDate(review.created_at)}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Кнопки модерации */}
                {!review.approved && (
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleApproveReview(review.id, true)}
                      className="text-green-600 hover:text-green-800 p-2 rounded-lg hover:bg-green-50 dark:hover:bg-green-900/20 transition-colors"
                      title="Одобрить отзыв"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                      </svg>
                    </button>
                    <button
                      onClick={() => handleApproveReview(review.id, false)}
                      className="text-red-600 hover:text-red-800 p-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                      title="Отклонить отзыв"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                )}
              </div>

              <div className="mb-4">
                <p className="text-[#1E293B] dark:text-white leading-relaxed">
                  {review.content}
                </p>
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-gray-200 dark:border-gray-700">
                <div className="text-sm text-[#64748B] dark:text-gray-400">
                  Товар: <span className="font-medium text-[#1E293B] dark:text-white">
                    {review.products.name || `Товар #${review.product_id}`}
                  </span>
                </div>
                
                <div className="flex items-center gap-2">
                  <span className="text-xs text-[#64748B] dark:text-gray-400">
                    ID: {review.id}
                  </span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Пагинация */}
        {pagination.totalPages > 1 && (
          <div className="flex items-center justify-center gap-2 mt-8">
            <button
              onClick={() => setPage(Math.max(1, page - 1))}
              disabled={page === 1}
              className="px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-600 text-sm text-[#1E293B] dark:text-white disabled:opacity-50 disabled:cursor-not-allowed hover:border-[#1A6DFF]/30 transition-colors"
            >
              Назад
            </button>
            
            <div className="flex items-center gap-1">
              {Array.from({ length: pagination.totalPages }, (_, i) => i + 1)
                .filter(pageNum => 
                  pageNum === 1 || 
                  pageNum === pagination.totalPages || 
                  Math.abs(pageNum - page) <= 2
                )
                .map((pageNum, index, array) => (
                  <div key={pageNum}>
                    {index > 0 && array[index - 1] !== pageNum - 1 && (
                      <span className="px-2 text-[#64748B] dark:text-gray-400">...</span>
                    )}
                    <button
                      onClick={() => setPage(pageNum)}
                      className={`px-3 py-2 rounded-lg text-sm transition-colors ${
                        pageNum === page
                          ? 'bg-[#1A6DFF] text-white'
                          : 'border border-gray-200 dark:border-gray-600 text-[#1E293B] dark:text-white hover:border-[#1A6DFF]/30'
                      }`}
                    >
                      {pageNum}
                    </button>
                  </div>
                ))
              }
            </div>

            <button
              onClick={() => setPage(Math.min(pagination.totalPages, page + 1))}
              disabled={page === pagination.totalPages}
              className="px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-600 text-sm text-[#1E293B] dark:text-white disabled:opacity-50 disabled:cursor-not-allowed hover:border-[#1A6DFF]/30 transition-colors"
            >
              Вперед
            </button>
          </div>
        )}

        {reviews.length === 0 && !loading && (
          <div className="text-center py-12">
            <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center">
              <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-3.582 8-8 8a8.959 8.959 0 01-4.906-1.456l-3.612 1.928a.75.75 0 01-.966-.852l1.19-4.17A8 8 0 1121 12z" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-[#1E293B] dark:text-white mb-2">
              Отзывы не найдены
            </h3>
            <p className="text-[#64748B] dark:text-gray-400">
              Попробуйте изменить фильтры поиска
            </p>
          </div>
        )}
      </div>
    </div>
  );
} 