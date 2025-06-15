import { forwardRef } from 'react';
import { reviews } from '@/drizzle/schema'
import { Star } from 'lucide-react';
import { ratingConfig, getStars } from '@/lib/reviewHelpers';
import { cn } from '@/lib/utils';

type Props = React.HTMLAttributes<HTMLDivElement> & {
  rating: (typeof reviews.$inferSelect)['rating']
  keyPrefix: string,
}

export default forwardRef<HTMLDivElement, Props>(
  function StarRating({ rating, keyPrefix, className, ...divProps }, ref) {
    const { starCount, starValue } = ratingConfig;
    const hasRating = rating !== null;
    const stars = getStars(rating || 0);
    return (
      <div className={cn('relative', className)}
        title={rating !== null ? `Rating: ${(rating / starValue).toFixed(2)} / ${starCount}` : 'No Rating'}
        ref={ref}
        {...divProps}
      >
        <div className='flex'>
          {Array(starCount).fill(0).map((_, i) => (
            <Star key={`${keyPrefix}-empty-star-${i}`} className={`text-muted-foreground ${hasRating ? '' : 'opacity-50'}`} />
          ))}
        </div>
        <div className='flex absolute top-0 left-0'>
          {Array(starCount).fill(0).map((_, i) => (
            <div className='w-6 h-6' key={`${keyPrefix}-filled-star-${i}`}>
              <div className='overflow-clip' style={{ width: `${stars[i]}%` }}>
                <Star className='text-yellow-500 fill-yellow-500' />
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  }
)
