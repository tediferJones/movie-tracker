'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import Loading from '@/components/subcomponents/loading';
import { useUser } from '@clerk/nextjs';
import easyFetchV3 from '@/lib/easyFetchV3';
import { reviews } from '@/drizzle/schema';

type ExistingReview = typeof reviews.$inferSelect & { title?: string }

export default function ReviewsDisplay(
  {
    imdbId,
    extTrigger,
  }: {
    imdbId?: string,
    extTrigger?: boolean,
  }
) {
  const [reviews, setReviews] = useState<ExistingReview[]>();
  const { user } = useUser();

  useEffect(() => {
    // if imdbId exists, only fetch records related to imdbId
    // if no imdbId, fetch all records for user
    if (!imdbId) {
      if (!user?.username) return;
      easyFetchV3<ExistingReview[]>({
        route: `/api/users/${user.username}/reviews`,
        method: 'GET',
      }).then(data => setReviews(data));
    } else {
      easyFetchV3<ExistingReview[]>({
        route: `/api/media/${imdbId}/reviews`,
        method: 'GET',
      }).then(data => setReviews(data));
    }
  }, [extTrigger, user?.username]);

  return (
    !reviews ? <Loading /> :
      <div className='showOutline px-4 flex flex-col'>
        {reviews.length === 0 ? <div className='p-4 text-center'>No Existing Reviews</div> : 
          reviews.map((review, i) => {
            return <div className={`flex flex-col gap-4 p-4 ${i < reviews.length - 1 ? 'border-b' : ''}`} key={`review-${i}`}>
              <div className='flex gap-4 flex-wrap'>
                <Link className='hover:underline flex-1 text-center'
                  href={imdbId ? `/users/${review.username}` : `/media/${review.imdbId}`}
                >
                  {imdbId ? review.username : review.title}
                </Link>
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
            </div>
          })
        }
      </div>
  )
}

// export default function ReviewsDisplay({ reviews }: { reviews: ReviewsRes[] }) {
//   return (
//     <div className='showOutline px-4 flex flex-col'>
//       {reviews.length === 0 ? <div className='p-4 text-center'>No Existing Reviews</div> : 
//         reviews.map((review, i) => {
//           return <div className={`flex flex-col gap-4 p-4 ${i < reviews.length - 1 ? 'border-b' : ''}`} key={`review-${i}`}>
//             <div className='flex gap-4 flex-wrap'>
//               <Link className='hover:underline flex-1 text-center'
//                 href={review.title ? `/media/${review.imdbId}` : `/users/${review.username}`}
//               >
//                 {review.title || review.username}
//               </Link>
//               <div className='flex-1 text-center'>
//                 {review.watchAgain === null ? <span className='text-muted-foreground'>No Opinion</span>
//                   : <span>{`Would ${review.watchAgain ? '' : 'NOT'} watch again`}</span>
//                 }
//               </div>
//               <div className='flex-1 text-center'>
//                 {review.rating ? <span>{`${review.rating / 20} / 5`}</span>
//                   : <span className='text-muted-foreground'>No Rating</span>
//                 }
//               </div>
//             </div>
//             <div className='text-center'>
//               {review.review ? <span className='break-words'>{review.review}</span>
//                 : <span className='text-muted-foreground'>No Review Content</span>
//               }
//             </div>
//           </div>
//         })
//       }
//     </div>
//   )
// }
