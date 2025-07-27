'use client';

import { Fragment, useEffect, useState } from 'react';
import Link from 'next/link';
import { reviews } from '@/drizzle/schema';
import { Eye } from 'lucide-react';
import Loading from '@/components/subcomponents/loading';
import AutoPaging from '@/components/subcomponents/AutoPaging';
import SortAndFilter from '@/components/subcomponents/SortAndFilter';
import StarRating from '@/components/subcomponents/StarRating';
import easyFetch from '@/lib/easyFetch';
import { formatTimestamp } from '@/lib/formatters';
import { watchAgainConfig, ratingConfig } from '@/lib/reviewHelpers';
import { useUserData } from '@/context/userData';

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
  // FIX ME
  const [reviews, setReviews] = useState<ExistingReview[]>();
  const [allReviews, setAllReviews] = useState<ExistingReview[]>();
  const [page, setPage] = useState(1);

  const pageSize = 5;
  const displayType = username ? 'title' : 'username';

  const userData = useUserData();
  useEffect(() => {
    // if imdbId exists, only fetch records related to imdbId
    // if no imdbId, fetch all records for user
    if (userData.current && userData.current.username === username) {
      const reviews = userData.current.getResource('reviews').data;
      setReviews(reviews);
      setAllReviews(reviews);
    } else if (username) {
      easyFetch<ExistingReview[]>({
        route: `/api/users/${username}/reviews`,
        method: 'GET',
      }).then(data => {
          setReviews(data);
          setAllReviews(data);
        });
    } else if (imdbId) {
      easyFetch<ExistingReview[]>({
        route: `/api/media/${imdbId}/reviews`,
        method: 'GET',
      }).then(data => {
          setReviews(data);
          setAllReviews(data);
        });
    } else {
      throw Error('reviewsDisplay requires an imdbId or a username');
    }
  }, [extTrigger, username, userData]);

  return (
    <div className='showOutline flex flex-col gap-2 p-4 max-h-[90vh]'>
      {!reviews || !allReviews ? <Loading /> :
        <>
          <SortAndFilter<ExistingReview> 
            allData={allReviews}
            subsetState={[reviews, setReviews]}
            searchable={['review', displayType]}
            sortable={{
              date: (a, b) => a - b,
              rating: (a, b) => (a || 0) - (b || 0),
              watchAgain: (a, b) => {
                const order = [false, null, true];
                return order.indexOf(a) - order.indexOf(b);
              },
              [displayType]: (a: string, b: string) => {
                return a.toLowerCase().localeCompare(b.toLowerCase())
              }
            }}
            filterable={{
              'watchAgain': {
                values: Object.values(watchAgainConfig).map(val => val.value),
                names: Object.values(watchAgainConfig).map(val => val.description),
              },
            }}
            rangeable={{
              'rating': {
                min: ratingConfig.minRating,
                max: ratingConfig.maxRating,
                step: ratingConfig.starCount / ratingConfig.maxRating,
                factor: ratingConfig.starValue,
                format: (n: number) => n.toFixed(2),
              }
            }}
            prefix={<h3 className='text-xl my-auto'>Reviews</h3>}
            keyPrefix='reviews'
          />
          <hr className='my-2' />
          <div className='overflow-y-scroll pr-2 snap-both snap-mandatory'>
            {reviews.length === 0 ?
              <div className='p-4 text-center text-muted-foreground'>No Reviews Found</div> : 
              reviews.slice(0, page * pageSize).map((review, i) => {
                const {
                  className,
                  description,
                } = watchAgainConfig[`${review.watchAgain}`];
                return (
                  <Fragment key={`reviewsDisplay-${i}`}>
                    {i > 0 && <hr className='my-2' />}
                    <Link className='text-foreground group flex flex-col gap-4 p-4 hover:bg-secondary rounded-lg snap-center'
                      key={`review-${i}`}
                      href={imdbId ? `/users/${review.username}` : `/media/${review.imdbId}`}
                    >
                      <div className='flex gap-4 flex-wrap'>
                        <span className='text-primary group-hover:underline flex-1 text-center'>
                          {imdbId ? review.username : review.title}
                        </span>
                        <div className='flex-1 text-center'></div>
                        <div className='flex-1 text-center flex gap-4 justify-center'>
                          <span title={description}>
                            <Eye className={`${className} ${review.watchAgain !== null ? '' : 'opacity-50'}`} />
                          </span>
                          <StarRating keyPrefix={review.title|| review.username}
                            rating={review.rating}
                          />
                        </div>
                      </div>
                      <div className='text-center'>
                        {review.review ? <span className='break-words'>{review.review}</span>
                          : <span className='text-muted-foreground'>No Review Content</span>
                        }
                      </div>
                      <div className='ml-auto text-muted-foreground'>
                        {formatTimestamp(
                          review.date,
                          { year: 'numeric', month: 'long', day: 'numeric', }
                        )}
                      </div>
                    </Link>
                  </Fragment>
                )
              })
            }
            <AutoPaging 
              setPage={setPage}
              currentCount={page * pageSize}
              maxCount={reviews?.length || 0}
            />
          </div>
        </>
      }
    </div>
  )
}
