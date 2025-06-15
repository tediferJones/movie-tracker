type WatchAgainOpts = 'true' | 'null' | 'false'
type OptData = {
  className: string,
  activeClassName: string,
  description: string,
  value: boolean | null
}

const maxRating = 100;
const minRating = 0;
const starCount = 5;
const starValue = maxRating / starCount;

export const ratingConfig = {
  maxRating,
  minRating,
  starCount,
  starValue,
}

export function getStars(rating: number) {
  return Array.from({ length: starCount }, () => {
    let fillPercent = 0;
    if (rating >= starValue) {
      fillPercent = 100;
    }
    if (0 < rating && rating < starValue) {
      fillPercent = Math.round(rating / starValue * 100);
    }
    rating -= starValue;
    return fillPercent;
  });
}

export const watchAgainConfig: { [key in WatchAgainOpts]: OptData }  = {
  true: {
    className: 'text-green-500',
    activeClassName: 'bg-green-500 hover:bg-green-600',
    description: 'Would watch again',
    value: true,
  },
  null: {
    className: 'text-muted-foreground',
    activeClassName: 'bg-secondary',
    description: 'No Opinion',
    value: null,
  },
  false: {
    className: 'text-red-500',
    activeClassName: 'bg-red-500 hover:bg-red-600',
    description: 'Would NOT watch again',
    value: false,
  },
}
