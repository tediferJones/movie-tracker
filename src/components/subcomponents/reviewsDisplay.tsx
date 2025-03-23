import { ReviewsRes } from '@/types'
import Link from 'next/link'

export default function ReviewsDisplay({ reviews }: { reviews: ReviewsRes[] }) {
  return (
    <div className='showOutline px-4 flex flex-col'>
      {reviews.length === 0 ? <div className='p-4 text-center'>No Existing Reviews</div> : 
        reviews.map((review, i) => {
          return <div className={`flex flex-col gap-4 p-4 ${i < reviews.length - 1 ? 'border-b' : ''}`} key={`review-${i}`}>
            <div className='flex gap-4 flex-wrap'>
              <Link className='hover:underline flex-1 text-center'
                href={review.title ? `/media/${review.imdbId}` : `/users/${review.username}`}
              >
                {review.title || review.username}
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
