'use client';

import { review } from '@prisma/client';
import { useState, useEffect } from 'react';
import easyFetch from '@/modules/easyFetch';

export default function DisplayReviews({ imdbID }: { imdbID: string }) {
  const [allReviews, setAllReviews] = useState<review[] | null>(null)

  useEffect(() => {
    easyFetch('/api/review', 'GET', { imdbID, getAll: true })
      .then((data: review[]) => setAllReviews(data))
  }, []);

  return (
    <div className='w-4/5 mx-auto'>
      <h1 className='pl-4 text-xl'>Reviews</h1>
      {allReviews === null ? <h1>Loading...</h1> :
        allReviews.length === 0 ? <h1 className='text-center py-4'>No reviews available</h1> :
          allReviews.map((review: review) => {
            return (
              <div className='m-4 bg-gray-700 p-4' key={review.username}>
                <div className='flex justify-between'>
                  <h1>Rating: {(review.myRating / 20).toFixed(2)} bags of popcorn</h1>
                  <h1>Watch Again? {review.watchAgain === null ? 'N/A' : review.watchAgain ? 'Yes' : 'No'}</h1>
                </div>
                <div className='flex justify-center p-4'>{review.myReview} </div>
                <div className='flex justify-end'>By: {review.username}</div>
              </div>
            )
          })
      }
    </div>
  )
}
