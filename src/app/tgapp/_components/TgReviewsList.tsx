"use client";

import { useEffect, useState } from "react";
import { IconComponent } from "@/components/webapp/IconComponent";

interface Review {
  id: number;
  content: string;
  rating: number;
  created_at: string;
  user: {
    id: number;
    display_name: string;
    photo_url?: string;
  };
}

interface ReviewStatistics {
  total_count: number;
  average_rating: number;
  rating_distribution: {
    rating: number; // 1-5
    count: number;
    percentage: number; // 0-100
  }[];
}

interface ReviewsData {
  reviews: Review[];
  statistics: ReviewStatistics;
}

interface TgReviewsListProps {
  productId: number;
  onReviewCreate?: () => void;
}

export default function TgReviewsList({ productId, onReviewCreate }: TgReviewsListProps) {
  const [data, setData] = useState<ReviewsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [showAll, setShowAll] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const resp = await fetch(`/api/webapp/products/${productId}/reviews`);
        if (resp.ok) {
          const json = await resp.json();
          setData(json);
        }
      } catch (e) {
        console.error("reviews fetch", e);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [productId]);

  if (loading) return <div className="text-sm text-gray-500">Загрузка отзывов…</div>;
  if (!data || data.reviews.length === 0) {
    return (
      <div className="space-y-3">
        <h2 className="text-base font-semibold">Отзывы</h2>
        <div className="text-sm text-gray-500">Пока нет отзывов.</div>
        {onReviewCreate && (
          <button
            onClick={onReviewCreate}
            className="px-4 py-2 bg-webapp-brand text-white rounded-lg text-sm active:scale-95"
          >
            Оставить отзыв
          </button>
        )}
      </div>
    );
  }

  const { statistics, reviews } = data;
  const displayed = showAll ? reviews : reviews.slice(0, 3);

  const renderStars = (rating: number, size = 16) => (
    <div className="flex space-x-0.5">
      {[1, 2, 3, 4, 5].map((i) => (
        <IconComponent
          key={i}
          name="star"
          size={size}
          className={i <= rating ? "text-yellow-400" : "text-gray-300"}
        />
      ))}
    </div>
  );

  return (
    <div className="space-y-6">
      {/* header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="text-3xl font-bold leading-none flex items-center">
            {statistics.average_rating.toFixed(1)}
          </div>
          {renderStars(Math.round(statistics.average_rating), 20)}
          <div className="text-sm text-gray-500 mt-1">
            {statistics.total_count} {getReviewWord(statistics.total_count)}
          </div>
        </div>
        {onReviewCreate && (
          <button
            onClick={onReviewCreate}
            className="px-4 py-2 bg-webapp-brand text-white rounded-lg text-sm active:scale-95"
          >
            Оставить отзыв
          </button>
        )}
      </div>

      {/* distribution */}
      <div className="space-y-1">
        {statistics.rating_distribution.map((item) => (
          <div key={item.rating} className="flex items-center space-x-2">
            <span className="text-xs w-4 text-gray-500">{item.rating}</span>
            <div className="flex-1 h-2 bg-gray-200 dark:bg-gray-700 rounded">
              <div
                className="h-full bg-yellow-400 rounded"
                style={{ width: `${item.percentage}%` }}
              />
            </div>
            <span className="text-xs text-gray-500 w-10 text-right">
              {item.count}
            </span>
          </div>
        ))}
      </div>

      {/* list */}
      <div className="space-y-4">
        {displayed.map((r) => (
          <div key={r.id} className="flex space-x-3">
            {/* avatar */}
            {r.user.photo_url ? (
              <img
                src={r.user.photo_url}
                alt={r.user.display_name}
                className="w-10 h-10 rounded-full object-cover"
              />
            ) : (
              <div className="w-10 h-10 rounded-full bg-webapp-brand flex items-center justify-center text-white font-semibold">
                {r.user.display_name.charAt(0).toUpperCase()}
              </div>
            )}

            {/* body */}
            <div className="flex-1 space-y-1">
              <div className="text-sm font-medium text-gray-900 dark:text-gray-200">
                {r.user.display_name}
              </div>
              {renderStars(r.rating)}
              <div className="text-sm">{r.content}</div>
              <div className="text-xs text-gray-500">
                {new Date(r.created_at).toLocaleDateString("ru-RU", {
                  day: "numeric",
                  month: "long",
                  year: "numeric",
                })}
              </div>
            </div>
          </div>
        ))}
      </div>

      {reviews.length > 3 && (
        <button
          onClick={() => setShowAll(!showAll)}
          className="w-full px-4 py-2 bg-gray-100 dark:bg-gray-800 rounded-lg text-sm active:scale-95"
        >
          {showAll ? "Скрыть отзывы" : "Показать все отзывы"}
        </button>
      )}
    </div>
  );
}

function getReviewWord(count: number) {
  if (count % 10 === 1 && count % 100 !== 11) return "отзыв";
  if ([2, 3, 4].includes(count % 10) && ![12, 13, 14].includes(count % 100)) return "отзыва";
  return "отзывов";
} 