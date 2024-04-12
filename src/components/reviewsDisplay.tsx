import { ReviewsRes } from '@/types'
import Link from 'next/link'

export default function ReviewsDisplay({ reviews }: { reviews: ReviewsRes[] }) {
  return (
    <div className='showOutline px-4 flex flex-col'>
      {reviews.length === 0 ? <div className='p-4 text-center'>No Existing Reviews</div> : 
        reviews.map((review, i) => {
          return <div className={`flex flex-col gap-4 p-4 ${i < reviews.length - 1 ? 'border-b' : ''}`} key={`review-${i}`}>
            <div className='flex justify-around gap-4 flex-wrap'>
              <Link className='hover:underline'
                href={review.title ? `/media/${review.imdbId}` : `/users/${review.username}`}
              >
                {review.title || review.username}
              </Link>
              <div>{review.watchAgain === null ? '' : `Would ${review.watchAgain ? '' : 'NOT'} watch again`}</div>
              <div>{review.rating === null ? 'No Rating': review.rating / 20} / 5</div>
            </div>
            <div className='text-center'>{review.review}</div>
          </div>
        })
      }
    </div>
  )
}
