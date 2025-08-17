'use client';

import { Fragment, useState } from 'react';
import Link from 'next/link';
import { Eye } from 'lucide-react';
import Loading from '@/components/subcomponents/loading';
import AutoPaging from '@/components/subcomponents/AutoPaging';
import SortAndFilter from '@/components/subcomponents/SortAndFilter';
import StarRating from '@/components/subcomponents/StarRating';
import useIsSelf from '@/hooks/useIsSelf';
import useAsyncEffect from '@/hooks/useAsyncEffect';
import easyFetch from '@/lib/easyFetch';
import { formatTimestamp } from '@/lib/formatters';
import { watchAgainConfig, ratingConfig } from '@/lib/reviewHelpers';
import { useUserData } from '@/context/userData';
import { MakeFieldOptional, ReviewWithTitle } from '@/types';

type ReviewOptTitle = MakeFieldOptional<ReviewWithTitle, 'title'>

export default function ReviewsDisplay(
  {
    username,
    imdbId,
  }: {
    username?: string,
    imdbId?: string,
  }
) {
  const [reviews, setReviews] = useState<ReviewOptTitle[]>();
  // FIX ME
  // Could this be repalced with a ref?
  // This data does not change once set
  const [allReviews, setAllReviews] = useState<ReviewOptTitle[]>();
  const [page, setPage] = useState(1);
  
  const userData = useUserData();
  const isSelf = useIsSelf(username || '');

  const pageSize = 5;
  const displayType = username ? 'title' : 'username';

  // FIX ME this is still problematic,
  // we need to wait for both useIsSelf AND userData to settle
  // and this displays reviews in the wrong order
  useAsyncEffect(async () => {
    if (isSelf === null) return;
    if (!username && !imdbId) {
      throw Error('either username or imdbId is requied');
    }

    let reviews: ReviewOptTitle[];
    if (userData.current && isSelf) {
      console.log('USING CONTEXT')
      reviews = userData.current.getResource('reviews');
    } else {
      console.log('FETCHING')
      reviews = await easyFetch<ReviewOptTitle[]>({
        route: username ? `/api/users/${username}/reviews`
          : `/api/media/${imdbId}/reviews`,
        method: 'GET',
      });
    }
    setReviews(reviews);
    setAllReviews(reviews);
  }, [userData, isSelf]);

  return (
    <div className='showOutline flex flex-col gap-2 p-4 max-h-[90vh]'>
      {!reviews || !allReviews ? <Loading /> :
        <>
          <SortAndFilter 
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
