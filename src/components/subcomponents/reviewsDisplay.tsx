'use client';

import { Fragment, useEffect, useState } from 'react';
import Link from 'next/link';
import { reviews } from '@/drizzle/schema';
import { Eye, EyeOff, Star } from 'lucide-react';
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
  const [reviews, setReviews] = useState<ExistingReview[]>();
  const [allReviews, setAllReviews] = useState<ExistingReview[]>();
  const [page, setPage] = useState(1);

  const pageSize = 5;
  const displayType = username ? 'title' : 'username';

  const starCount = 5;
  const starValue = 20;

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

  function getStars(rating: number) {
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

  const watchAgainConverter = {
    true: {
      className: 'text-green-500',
      description: 'Would watch again',
    },
    null: {
      className: 'text-muted-foreground',
      description: 'No Opinion',
    },
    false: {
      className: 'text-red-500',
      description: 'Would NOT watch again',
    },
  }

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
                values: [true, null, false],
                names: ['Would watch again', 'No Opinion', 'Would NOT watch again']
              },
            }}
            rangeable={{
              'rating': {
                min: 0,
                max: 100,
                step: 0.05,
                factor: 20,
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
                const { className, description } = watchAgainConverter[`${review.watchAgain}`];
                const stars = getStars(review.rating || 0);
                const hasRating = review.rating !== null;
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
                        <div className='flex-1 text-center'>
                          {/*
                          {review.watchAgain === null ? <span className='text-muted-foreground'>No Opinion</span>
                            : <span>{`Would ${review.watchAgain ? '' : 'NOT'} watch again`}</span>
                          }
                          <div className='w-6 h-6'>
                            <div className='overflow-clip w-[30%]'>
                              <Star className='h-6 w-6'/>
                            </div>
                          </div>
                          */}
                        </div>
                        <div className='flex-1 text-center flex gap-4 justify-center'>
                          {/*
                          {review.rating ? <span>{`${review.rating / 20} / 5`}</span>
                            : <span className='text-muted-foreground'>No Rating</span>
                          }
                          {{
                            true: <Eye className='text-green-500' xlinkTitle={'Bello?'} />,
                            false: <Eye className='text-red-500' />,
                            null: <Eye className='text-muted-foreground' />,
                          }[`${review.watchAgain}`]}
                          */}
                          <span title={description}>
                            <Eye className={`${className} ${review.watchAgain !== null ? '' : 'opacity-50'}`} />
                          </span>
                          <div className='relative'
                            title={review.rating !== null ? `Rating: ${(review.rating / starValue).toFixed(2)} / ${starCount}` : 'No Rating'}
                          >
                            <div className='flex'>
                              {Array(starCount).fill(0).map((_, i) => (
                                <Star key={`empty-star-${i}`} className={`text-muted-foreground ${hasRating ? '' : 'opacity-50'}`} />
                              ))}
                            </div>
                            <div className='flex absolute top-0 left-0'>
                              {Array(starCount).fill(0).map((_, i) => (
                                <div className='w-6 h-6'>
                                  <div className='overflow-clip' style={{ width: `${stars[i]}%` }}>
                                    <Star key={`filled-star-${i}`} className='text-yellow-500 fill-yellow-500' />
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
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
