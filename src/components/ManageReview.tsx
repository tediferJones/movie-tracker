'use client';

import { useEffect, useState, ChangeEvent } from 'react';
// import { review } from '@/types';
import easyFetch from '@/modules/easyFetch';
import { review } from '@prisma/client';

export default function ManageReview({ imdbID }: { imdbID: string }) {
  const defaultState: review = {
    id: '',
    username: '',
    imdbID,
    watchAgain: null,
    myRating: 0,
    myReview: '',
  }
  const [existingReview, setExistingReview] = useState<review | null>(null);
  const [refreshTrigger, setRefreshTrigger] = useState<boolean>(false);
  const [myRatingToggle, setMyRatingToggle] = useState<boolean>(false);
  const [isHovering, setIsHovering] = useState<boolean>(false)

  useEffect(() => {
    easyFetch('/api/reviews', 'GET', { imdbID })
        .then((res: Response) => res.json())
        .then((data: review | null) => setExistingReview(data ? data : defaultState))
  }, [refreshTrigger])

  async function updateReview() {
    if (existingReview) {
      const fetchMethod = existingReview.username === '' ? 'POST' : 'PUT';
      await easyFetch('/api/reviews', fetchMethod, { ...existingReview, id: undefined });
      setRefreshTrigger(!refreshTrigger);
    }
  }

  function sliderHandler(e: any) {
    if (myRatingToggle && existingReview) {
      setExistingReview({ 
        ...existingReview, 
        myRating: Math.round(e.nativeEvent.offsetX / e.target.offsetWidth * 100),
      })
    }
  }

  async function deleteFunc() {
    if (existingReview && existingReview.imdbID) {
      await easyFetch('/api/reviews', 'DELETE', { imdbID });
      setRefreshTrigger(!refreshTrigger);
    }
  }

  // Each attribute we want to toggle should have its own button, 
  // the contents and function of which should change depending on its state,
  // after each change, use a refresh trigger to get the new results posted to the DB

  // ADD BUTTON TO DELETE REVIEW, route already exists in API, but it is essentially empty
  // We still need some kind of loading state, while we check the DB to see if a review exists

  return (
    <>
      {!existingReview ? <h1>Loading your review...</h1> :
        <div className='m-4 flex flex-col bg-gray-700 p-4'>
          <div className='mb-2 flex justify-between'>
            <h1 className='text-xl my-auto'>My Review</h1>
            {existingReview.id === '' ? [] : 
              <button className='bg-red-500 p-2' onClick={deleteFunc}>Delete Review</button>
            }
          </div>
          {/* <div>{JSON.stringify(existingReview)}</div> */}
          <div className='my-2 flex flex-wrap'>
            <div className='my-auto mr-4'>Watch Again?</div>
            <div className='flex flex-wrap flex-1 flex-col sm:flex-row'>
              <button className={existingReview.watchAgain === true ? 'flex-[2] bg-orange-400 p-2' : 'flex-1 bg-green-500 p-2'}
                onClick={() => setExistingReview({ 
                  ...existingReview, 
                  watchAgain: true, 
                })}
              >Watch Again</button>
              <button className={existingReview.watchAgain === null ? 'flex-[2] bg-orange-400 p-2' : 'flex-1 bg-blue-400 p-2'}
                onClick={() => setExistingReview({
                  ...existingReview,
                  watchAgain: null,
                })}
              >No Opinion</button>
              <button className={existingReview.watchAgain === false ? 'flex-[2] bg-orange-400 p-2' : 'flex-1 bg-red-500 p-2'}
                onClick={() => setExistingReview({
                  ...existingReview,
                  watchAgain: false,
                })}
              >Not Worth It</button>
            </div>
          </div>

          <div className='flex flex-wrap justify-between'>
            <label className='my-auto'
              htmlFor='myRating'
            >Rating: </label>
            <input className='border-4 text-black mx-4 my-2'
              name='myRating'
              value={(existingReview.myRating / 20).toFixed(2)} 
              onChange={(e: ChangeEvent<HTMLInputElement>) => setExistingReview({ 
                ...existingReview,
                myRating: Number(e.target.value) * 20,
              })} 
              type='number' min={0} max={5} step={0.05} 
            />

            <div className='flex-1 bg-blue-400 min-h-[2em] min-w-[8em] my-2 relative'
              id='myRatingParent'
              onMouseMove={sliderHandler} 
              onMouseEnter={() => setIsHovering(true)}
              onMouseLeave={() => {
                setMyRatingToggle(false)
                setIsHovering(false)
              }}
              onClick={() => setMyRatingToggle(!myRatingToggle)}
            >
              {!myRatingToggle && !isHovering ? [] : 
                <div className='absolute w-full h-full flex justify-center items-center'
                >Click to {myRatingToggle ? 'Set' : 'Edit'}</div>}
              <div className='h-full bg-orange-400' 
                style={{
                  width: `${existingReview.myRating}%`, 
                  pointerEvents: 'none'
                }}
              ></div>
            </div>
          </div>

          <textarea className='text-black my-2 p-2' 
            name='myReview' 
            value={existingReview.myReview} 
            onChange={(e) => setExistingReview({ 
              ...existingReview, 
              myReview: e.target.value 
            })}
            rows={4}
            placeholder='Write Your Review Here'
          ></textarea>

          <button className='bg-yellow-500 p-4 mt-2' onClick={updateReview}>{existingReview.username === '' ? 'SUBMIT' : 'UPDATE'} REVIEW</button>
        </div>
      }
    </>
  )
}
