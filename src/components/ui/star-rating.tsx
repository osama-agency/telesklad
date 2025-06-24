import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface StarRatingProps {
  rating: number;
  onRatingChange: (rating: number) => void;
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
}

const StarRating: React.FC<StarRatingProps> = ({
  rating,
  onRatingChange,
  size = 'md',
  disabled = false
}) => {
  const [hoverRating, setHoverRating] = React.useState(0);

  const sizes = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-8 h-8'
  };

  const starVariants = {
    filled: {
      scale: [1, 1.2, 1],
      transition: { duration: 0.3 }
    },
    unfilled: {
      scale: 1
    }
  };

  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <motion.button
          key={star}
          type="button"
          disabled={disabled}
          className={`relative ${sizes[size]} ${disabled ? 'cursor-not-allowed opacity-60' : 'cursor-pointer'}`}
          onClick={() => !disabled && onRatingChange(star)}
          onMouseEnter={() => !disabled && setHoverRating(star)}
          onMouseLeave={() => !disabled && setHoverRating(0)}
          variants={starVariants}
          animate={star <= (hoverRating || rating) ? 'filled' : 'unfilled'}
          whileHover={{ scale: disabled ? 1 : 1.1 }}
          whileTap={{ scale: disabled ? 1 : 0.9 }}
        >
          <svg
            className={`absolute inset-0 ${
              star <= (hoverRating || rating) ? 'text-[#4CAF50]' : 'text-gray-300'
            } transition-colors duration-200`}
            fill="currentColor"
            viewBox="0 0 24 24"
          >
            <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
          </svg>
          <AnimatePresence>
            {star <= (hoverRating || rating) && (
              <motion.span
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                exit={{ scale: 0 }}
                className="absolute inset-0 text-[#4CAF50] transform"
              >
                <svg
                  className="w-full h-full"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
                </svg>
              </motion.span>
            )}
          </AnimatePresence>
        </motion.button>
      ))}
    </div>
  );
};

export default StarRating; 