import { useState, useEffect } from 'react';
import { StarIcon } from './Icons';

/**
 * StarRating component for LumiFlix - mini project 2
 * 
 * This component provides an interactive 5-star rating system that allows users
 * to rate movies by clicking on stars. It supports both read-only display mode
 * and interactive rating mode.
 * 
 * @component
 * @param {Object} props - Component props
 * @param {number} props.rating - Current rating value (0-5)
 * @param {Function} props.onRatingChange - Callback function called when rating changes
 * @param {boolean} [props.readOnly=false] - Whether the rating is read-only
 * @param {number} [props.size=24] - Size of the stars in pixels
 * @param {string} [props.className=''] - Additional CSS classes
 * @returns {JSX.Element} The StarRating component
 * 
 * @example
 * ```tsx
 * <StarRating 
 *   rating={3} 
 *   onRatingChange={(rating) => console.log(rating)}
 * />
 * ```
 * 
 * @since 3.0.0
 */
type StarRatingProps = {
  rating: number; // 0-5, can be decimal for averages
  onRatingChange?: (rating: number) => void;
  readOnly?: boolean;
  size?: number;
  className?: string;
};

export default function StarRating({ 
  rating, 
  onRatingChange, 
  readOnly = false,
  size = 24,
  className = ''
}: StarRatingProps) {
  const [hoveredRating, setHoveredRating] = useState<number | null>(null);
  const [displayRating, setDisplayRating] = useState<number>(rating);

  useEffect(() => {
    setDisplayRating(rating);
  }, [rating]);

  const handleStarClick = (starValue: number) => {
    if (readOnly || !onRatingChange) return;
    onRatingChange(starValue);
    setDisplayRating(starValue);
  };

  const handleStarHover = (starValue: number) => {
    if (readOnly) return;
    setHoveredRating(starValue);
  };

  const handleMouseLeave = () => {
    if (readOnly) return;
    setHoveredRating(null);
  };

  const effectiveRating = hoveredRating !== null ? hoveredRating : displayRating;

  return (
    <div 
      className={`star-rating ${readOnly ? 'read-only' : 'interactive'} ${className}`}
      onMouseLeave={handleMouseLeave}
      role={readOnly ? 'img' : 'radiogroup'}
      aria-label={readOnly ? `Rating: ${rating} out of 5 stars` : 'Rate this movie'}
    >
      {[1, 2, 3, 4, 5].map((starValue) => {
        const isFilled = starValue <= Math.floor(effectiveRating);
        const isHalfFilled = !isFilled && starValue - 0.5 <= effectiveRating && effectiveRating < starValue;

        return (
          <button
            key={starValue}
            type="button"
            className={`star-button ${isFilled ? 'filled' : ''} ${isHalfFilled ? 'half-filled' : ''}`}
            onClick={() => handleStarClick(starValue)}
            onMouseEnter={() => handleStarHover(starValue)}
            disabled={readOnly}
            aria-label={`Rate ${starValue} out of 5 stars`}
            aria-pressed={!readOnly && displayRating === starValue}
          >
            <StarIcon 
              size={size} 
              filled={isFilled}
              className={isHalfFilled ? 'half-star' : ''}
            />
          </button>
        );
      })}
      {!readOnly && displayRating > 0 && (
        <span className="rating-value" aria-live="polite">
          {displayRating}/5
        </span>
      )}
    </div>
  );
}

