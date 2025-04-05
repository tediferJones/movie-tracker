'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { reviews } from '@/drizzle/schema';
import Loading from '@/components/subcomponents/loading';
import easyFetchV3 from '@/lib/easyFetchV3';

type ExistingReview = typeof reviews.$inferSelect & { title?: string }

export default function ReviewsDisplay(
  {
    username,
    imdbId,
    extTrigger,
  }: {
    username?: string,
    imdbId?: string,
    extTrigger?: boolean,
  }
) {
  const [reviews, setReviews] = useState<ExistingReview[]>();

  useEffect(() => {
    // if imdbId exists, only fetch records related to imdbId
    // if no imdbId, fetch all records for user
    if (username) {
      easyFetchV3<ExistingReview[]>({
        route: `/api/users/${username}/reviews`,
        method: 'GET',
      }).then(data => setReviews(data));
    } else if (imdbId) {
      easyFetchV3<ExistingReview[]>({
        route: `/api/media/${imdbId}/reviews`,
        method: 'GET',
      }).then(data => setReviews(data));
    } else {
      throw Error('reviewsDisplay requires an imdbId or a username');
    }
  }, [extTrigger, username]);

  return (
    !reviews ? <Loading /> :
      <div className='showOutline flex flex-col'>
        {reviews.length === 0 ? <div className='p-4 text-center text-muted-foreground'>No Reviews Found</div> : 
          reviews.map((review, i) => {
            return <Link className={`text-foreground group flex flex-col gap-4 p-4 hover:bg-secondary rounded-lg ${i < reviews.length - 1 ? 'border-b' : ''}`}
              key={`review-${i}`}
              href={imdbId ? `/users/${review.username}` : `/media/${review.imdbId}`}
            >
              <div className='flex gap-4 flex-wrap'>
                <span className='text-primary group-hover:underline flex-1 text-center'>
                  {imdbId ? review.username : review.title}
                </span>
                <div className='flex-1 text-center'>
                  {review.watchAgain === null ? <span className='text-muted-foreground'>No Opinion</span>
                    : <span>{`Would ${review.watchAgain ? '' : 'NOT'} watch again`}</span>
                  }
                </div>
                <div className='flex-1 text-center'>
                  {review.rating ? <span>{`${review.rating / 20} / 5`}</span>
                    : <span className='text-muted-foreground'>No Rating</span>
                  }
                </div>
              </div>
              <div className='text-center'>
                {review.review ? <span className='break-words'>{review.review}</span>
                  : <span className='text-muted-foreground'>No Review Content</span>
                }
              </div>
            </Link>
          })
        }
      </div>
  )
}
