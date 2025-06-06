'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { reviews } from '@/drizzle/schema';
import Loading from '@/components/subcomponents/loading';
import AutoPaging from '@/components/subcomponents/AutoPaging';
import SortAndFilter from '@/components/subcomponents/SortAndFilter';
import easyFetch from '@/lib/easyFetch';
import { formatTimestamp } from '@/lib/formatters';

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
  // Add searchbar (similar to table)
  //  - sort by Date, review value, watchAgain value, title/username depending on presence of username/imdbId 
  //  - search by review min/max, watchAgain value, title/username depending on presence of username/imdbId
  //  - consider using checkboxes for filtering, that way users can do something like:
  //    - show reviews with review content, watchAgain true or null, and rating greater than 2 but less than 4
  const [reviews, setReviews] = useState<ExistingReview[]>();
  const [allReviews, setAllReviews] = useState<ExistingReview[]>();
  const [page, setPage] = useState(1);

  const pageSize = 5;
  const displayType = username ? 'title' : 'username';

  useEffect(() => {
    // if imdbId exists, only fetch records related to imdbId
    // if no imdbId, fetch all records for user
    if (username) {
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
  }, [extTrigger, username]);

  return (
    <div className='showOutline flex flex-col gap-2 p-4 max-h-[480px]'>
      {!reviews || !allReviews ? <div>borked</div> :
        <SortAndFilter<ExistingReview> 
          allDataState={[allReviews, setAllReviews]}
          subsetState={[reviews, setReviews]}
          searchable={['review', displayType]}
          // sortable={['date', 'rating', 'watchAgain', displayType]}
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
              type: 'select',
              values: [true, null, false],
              names: ['Would watch again', 'No Opinion', 'Would NOT watch again']
            },
            'rating': {
              type: 'number',
              min: 0,
              max: 100,
              step: 0.05,
              factor: 20,
              // formatFunc: (n) => Math.round(n) / 20
            }
          }}
          prefix={<h3 className='text-xl my-auto'>Reviews</h3>}
          keyPrefix='reviews'
        />
      }
      {/*
      <hr className='my-2' />
      */}
      <div className='overflow-y-scroll pr-2'>
        {!reviews ? <Loading /> :
          reviews.length === 0 ? <div className='p-4 text-center text-muted-foreground'>No Reviews Found</div> : 
            reviews.slice(0, page * pageSize).map((review, i) => {
              return (
                <>
                  <hr className='my-2' />
                  <Link className='text-foreground group flex flex-col gap-4 p-4 hover:bg-secondary rounded-lg'
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
                    <div className='ml-auto text-muted-foreground'>
                      {formatTimestamp(
                        review.date,
                        { year: 'numeric', month: 'long', day: 'numeric', }
                      )}
                    </div>
                  </Link>
                  {/*
                  {i < reviews.length - 1 && <hr className='my-2' />}
                  */}
                </>
              )
            })
        }
        <AutoPaging 
          setPage={setPage}
          currentCount={page * pageSize}
          maxCount={reviews?.length || 0}
        />
      </div>
    </div>
  )
}
