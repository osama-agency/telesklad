"use client";

import { useState } from "react";
import { IconComponent } from "@/components/webapp/IconComponent";
import { PhotoUploader } from "./PhotoUploader";

interface TgReviewFormProps {
  productId: number;
  productName: string;
  onSuccess?: () => void;
  onCancel?: () => void;
}

export default function TgReviewForm({ productId, productName, onSuccess, onCancel }: TgReviewFormProps) {
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [content, setContent] = useState("");
  const [photos, setPhotos] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  const triggerHaptic = (type: "light" | "medium" | "heavy" = "medium") => {
    if (typeof window !== "undefined" && "vibrate" in navigator) {
      const patterns = { light: [10], medium: [20], heavy: [30] } as const;
      // @ts-ignore
      navigator.vibrate(patterns[type]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!rating) {
      setError("Пожалуйста, выберите рейтинг");
      triggerHaptic("heavy");
      return;
    }
    if (content.trim().length < 5) {
      setError("Отзыв должен содержать минимум 5 символов");
      triggerHaptic("heavy");
      return;
    }
    if (content.length > 1000) {
      setError("Отзыв должен содержать максимум 1000 символов");
      triggerHaptic("heavy");
      return;
    }

    setIsSubmitting(true);
    setError("");
    triggerHaptic("medium");

    try {
      const resp = await fetch(`/api/webapp/products/${productId}/reviews`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: content.trim(), rating, photos, tg_id: "9999" }),
      });
      const json = await resp.json();
      if (resp.ok) {
        triggerHaptic("light");
        onSuccess?.();
      } else {
        setError(json.error || "Ошибка отправки");
        triggerHaptic("heavy");
      }
    } catch (e) {
      console.error(e);
      setError("Ошибка отправки");
      triggerHaptic("heavy");
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderStars = () => (
    <div className="flex space-x-2">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          type="button"
          key={star}
          onClick={() => {
            setRating(star);
            triggerHaptic("light");
          }}
          onMouseEnter={() => setHoverRating(star)}
          onMouseLeave={() => setHoverRating(0)}
        >
          <IconComponent
            name="star"
            size={28}
            className={
              star <= (hoverRating || rating) ? "text-yellow-400" : "text-gray-400"
            }
          />
        </button>
      ))}
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <h2 className="text-lg font-semibold">Оставить отзыв</h2>
        <p className="text-webapp-brand font-medium">{productName}</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Rating */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Рейтинг</label>
          {renderStars()}
        </div>

        {/* Content */}
        <div className="space-y-2">
          <label htmlFor="content" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Отзыв
          </label>
          <textarea
            id="content"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            rows={4}
            className="w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 p-3 text-sm focus:ring-webapp-brand focus:border-webapp-brand placeholder-gray-400 dark:placeholder-gray-500"
            placeholder="Расскажите о своём опыте использования товара..."
            maxLength={1000}
          />
          <div className="text-xs text-gray-500">
            {content.length}/1000 символов
          </div>
        </div>

        {/* Photos */}
        <PhotoUploader onPhotosChange={setPhotos} maxPhotos={3} disabled={isSubmitting} />

        {error && (
          <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">
            {error}
          </div>
        )}

        {/* Buttons */}
        <div className="flex gap-3">
          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              disabled={isSubmitting}
              className="flex-1 py-3 rounded-lg bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 text-sm font-medium active:scale-95 disabled:opacity-50"
            >
              Отмена
            </button>
          )}
          <button
            type="submit"
            disabled={isSubmitting || !rating || content.trim().length < 5}
            className="flex-1 py-3 rounded-lg bg-webapp-brand text-white text-sm font-medium active:scale-95 disabled:opacity-50"
          >
            {isSubmitting ? "Отправляем..." : "Опубликовать"}
          </button>
        </div>

        <p className="text-xs text-gray-500 text-center">Отзыв будет опубликован после модерации</p>
      </form>
    </div>
  );
} 