'use client';

import { useEffect, useState } from 'react';
import easyFetch from '@/lib/easyFetch';
import { reviews } from '@/drizzle/schema';
import Loading from '@/components/loading';

type ReviewRecord = typeof reviews.$inferSelect;

export default function ReviewManager({ imdbId }: { imdbId: string }) {
  const [existingReview, setExistingReview] = useState<ReviewRecord>();
  const [refreshTrigger, setRefreshTrigger] = useState<boolean>(false);
  const [lockRating, setLockRating] = useState<boolean>(false);
  const [isHovering, setIsHovering] = useState<boolean>(false);

  useEffect(() => {
    easyFetch<ReviewRecord>('/api/reviews', 'GET', { imdbId })
      .then(data => setExistingReview(data ? data : {
        username: null,
        review: null,
        rating: null,
        watchAgain: null,
        imdbId,
      }))
  }, [refreshTrigger])

  return !existingReview ? <Loading /> :
    <div className='flex flex-col gap-4 p-4 border-2'>
      <div className='flex justify-between'>
        <h1 className='text-xl my-auto'>My Review</h1>
        {!existingReview.username ? [] : 
          <button className='bg-red-500 p-2'
            onClick={() => {
              easyFetch('/api/reviews', 'DELETE', { imdbId })
                .then(() => setRefreshTrigger(!refreshTrigger))
            }}
          >Delete My Review</button>
        }
      </div>

      <div className='flex sm:flex-row flex-col gap-4'>
        <div className='m-auto ml-0'>Watch Again?</div>
        <button className={`w-1/4 ${existingReview.watchAgain === true ? 'bg-green-500' : 'colorPrimary'}`}
          onClick={() => setExistingReview({
            ...existingReview,
            watchAgain: [null, false].includes(existingReview.watchAgain) ? true : null,
          })}
        >Watch Again</button>
        <button className={`w-1/4 ${existingReview.watchAgain === false ? 'bg-red-500' : 'colorPrimary'}`}
          onClick={() => setExistingReview({
            ...existingReview,
            watchAgain: [null, true].includes(existingReview.watchAgain) ? false : null,
          })}
        >Not Worth It</button>
      </div>

      <div className='flex flex-wrap justify-between'>
        <label className='my-auto'
          htmlFor='myRating'
        >Rating: </label>
        <input className='mx-4 p-2'
          name='myRating'
          value={((existingReview.rating || 0) / 20).toFixed(2)} 
          onChange={e => setExistingReview({ 
            ...existingReview,
            rating: Number(e.target.value) * 20,
          })} 
          type='number' min={0} max={5} step={0.05} 
        />

        <div className='flex-1 colorPrimary min-h-[2em] min-w-[8em] relative'
          onMouseMove={e => {
            if (lockRating && existingReview) {
              setExistingReview({ 
                ...existingReview, 
                rating: Math.round(e.nativeEvent.offsetX / e.currentTarget.offsetWidth * 100),
              })
            }
          }} 
          onMouseEnter={() => setIsHovering(true)}
          onMouseLeave={() => {
            setLockRating(false)
            setIsHovering(false)
          }}
          onClick={() => setLockRating(!lockRating)}
        >
          {!lockRating && !isHovering ? [] : 
            <div className='absolute w-full h-full flex justify-center items-center'
            >Click to {lockRating ? 'Set' : 'Edit'}</div>
          }
          <div className='h-full bg-yellow-500' // bg-orange-400
            style={{
              width: `${existingReview.rating || 0}%`, 
              pointerEvents: 'none'
            }}
          ></div>
        </div>
      </div>

      <textarea className='p-2 border-2' 
        name='myReview' 
        value={existingReview.review || ''} 
        onChange={(e) => setExistingReview({ 
          ...existingReview, 
          review: e.target.value 
        })}
        rows={4}
        placeholder='Write Your Review Here'
      ></textarea>

      <button className='colorPrimary'
        onClick={() => {
          easyFetch('/api/reviews', existingReview.username ? 'PUT' : 'POST', existingReview, true)
            .then(() => setRefreshTrigger(!refreshTrigger))
        }}
      >
        {existingReview.username ? 'Update' : 'Submit'} Review
      </button>
    </div>
}
