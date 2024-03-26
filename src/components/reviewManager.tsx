'use client';

import { useEffect, useState } from 'react';
import easyFetch from '@/lib/easyFetch';
import { reviews } from '@/drizzle/schema';
import Loading from '@/components/loading';

type ReviewRecord = typeof reviews.$inferSelect;

export default function ReviewManager({ imdbId }: { imdbId: string }) {
  const [existingReview, setExistingReview] = useState<ReviewRecord>();
  const [refreshTrigger, setRefreshTrigger] = useState<boolean>(false);
  const [lockRating, setLockRating] = useState<boolean>(true);
  const [isHovering, setIsHovering] = useState<boolean>(false);

  useEffect(() => {
    easyFetch<ReviewRecord>('/api/review', 'GET', { imdbId })
      .then(data => setExistingReview(data ? data : {
        username: null,
        review: null,
        rating: null,
        watchAgain: null,
        imdbId,
      }))
  }, [refreshTrigger])

  // Each attribute we want to toggle should have its own button, 
  // the contents and function of which should change depending on its state,
  // after each change, use a refresh trigger to get the new results posted to the DB

  // ADD BUTTON TO DELETE REVIEW, route already exists in API, but it is essentially empty
  // We still need some kind of loading state, while we check the DB to see if a review exists

  return !existingReview ? <Loading /> :
    <div className='m-4 flex flex-col p-4 border-2 w-4/5 mx-auto my-4'>
      <div className='mb-2 flex justify-between'>
        <h1 className='text-xl my-auto'>My Review</h1>
        {!existingReview.username ? [] : 
          <button className='bg-red-500 p-2'
            onClick={() => {
              easyFetch('/api/review', 'DELETE', { imdbId })
                .then(() => setRefreshTrigger(!refreshTrigger))
            }}
          >Delete My Review</button>
        }
      </div>
      {/* <div>{JSON.stringify(existingReview)}</div> */}
      <div className='my-2 flex sm:flex-row flex-col gap-4'>
        <div className='m-auto'>Watch Again?</div>
        <button className={existingReview.watchAgain === true ? 'flex-[2] bg-orange-400 p-2' : 'flex-1 bg-green-500 p-2'}
          onClick={() => setExistingReview({ ...existingReview, watchAgain: true, })}
        >Watch Again</button>
        <button className={existingReview.watchAgain === null ? 'flex-[2] bg-orange-400 p-2' : 'flex-1 bg-blue-400 p-2'}
          onClick={() => setExistingReview({ ...existingReview, watchAgain: null, })}
        >No Opinion</button>
        <button className={existingReview.watchAgain === false ? 'flex-[2] bg-orange-400 p-2' : 'flex-1 bg-red-500 p-2'}
          onClick={() => setExistingReview({ ...existingReview, watchAgain: false, })}
        >Not Worth It</button>
      </div>

      <div className='flex flex-wrap justify-between'>
        <label className='my-auto'
          htmlFor='myRating'
        >Rating: </label>
        <input className='mx-4 my-2 p-2'
          name='myRating'
          value={((existingReview.rating || 0) / 20).toFixed(2)} 
          onChange={e => setExistingReview({ 
            ...existingReview,
            rating: Number(e.target.value) * 20,
          })} 
          type='number' min={0} max={5} step={0.05} 
        />

        <div className='flex-1 bg-blue-400 min-h-[2em] min-w-[8em] my-2 relative'
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
          <div className='h-full bg-orange-400' 
            style={{
              width: `${existingReview.rating}%`, 
              pointerEvents: 'none'
            }}
          ></div>
        </div>
      </div>

      <textarea className='my-2 p-2' 
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
          easyFetch('/api/review', existingReview.username ? 'PUT' : 'POST', existingReview, true)
            .then(() => setRefreshTrigger(!refreshTrigger))
        }}
      >
        {existingReview.username === '' ? 'SUBMIT' : 'UPDATE'} REVIEW
      </button>
    </div>
}
