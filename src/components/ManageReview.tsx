'use client';

import { useEffect, useState, ChangeEvent } from 'react';
import { review } from '@/types';
import easyFetch from '@/modules/easyFetch';

export default function ManageReview(props: { imdbID: string }) {
  const { imdbID } = props;
  const defaultState = {
    username: '',
    imdbID,
    watchAgain: false,
    myRating: 0,
  }
  const [existingReview, setExistingReview] = useState<review | null>(null);
  const [refreshTrigger, setRefreshTrigger] = useState<boolean>(false);
  const [myRatingToggle, setMyRatingToggle] = useState<boolean>(false);

  useEffect(() => {
    easyFetch('/api/reviews', 'GET', { imdbID })
        .then((res: Response) => res.json())
        .then((data: review) => setExistingReview(data ? data : defaultState))
  }, [refreshTrigger])

  async function updateMovieDetails(key: string) {
    if (existingReview) {
      const fetchMethod = existingReview.username === '' ? 'POST' : 'PUT'
      await easyFetch('/api/reviews', fetchMethod, { 
        ...existingReview,
        [key]: key === 'myRating' ? existingReview[key] : !existingReview[key]
      })
      setRefreshTrigger(!refreshTrigger);
    }
  }

  function sliderHandler(e: any) {
    if (myRatingToggle) {
      document.getElementById('HoverText')?.remove()
      if (existingReview) {
        setExistingReview({ 
          ...existingReview, 
          myRating: Math.round(e.nativeEvent.offsetX / e.target.offsetWidth * 100),
        })
      }
    } else {
      if (!document.getElementById('HoverText')) {
        const hoverText = document.createElement('div');
        hoverText.id = 'HoverText'
        hoverText.innerHTML = 'Click to Edit'
        hoverText.style.position = 'absolute';
        document?.getElementById('myRatingParent')?.prepend(hoverText)
      }
    }
  }

  // Each attribute we want to toggle should have its own button, 
  // the contents and function of which should change depending on its state,
  // after each change, use a refresh trigger to get the new results posted to the DB

  // ADD BUTTON TO DELETE REVIEW, route already exists in API, but it is essentially empty
  // We still need some kind of loading state, while we check the DB to see if a review exists

  // Consider getting rid of the UpdateRating button, 
  // when the user re-locks the slider, or changes the input box manually, call updateMovieDetails('myRating')

  return (
    <>
      {!existingReview ? <h1>Loading your review...</h1> :
      <div className='bg-yellow-400'>
        <div>{JSON.stringify(existingReview)}</div>
        <button onClick={() => updateMovieDetails('watchAgain')}>Toggle Watch Again</button>
        <hr />

        <label htmlFor='myRating'>myRating</label>
        <input className='border-4'
          name='myRating'
          value={(existingReview.myRating / 20).toFixed(2)} 
          onChange={(e: ChangeEvent<HTMLInputElement>) => setExistingReview({ 
            ...existingReview,
            myRating: Number(e.target.value) * 20,
          })} 
          type='number' min={0} max={5} step={0.05} 
        />

        <div className='h-16 bg-blue-400'
          id='myRatingParent'
          onMouseMove={sliderHandler} 
          onMouseLeave={() => document.getElementById('HoverText')?.remove()}
          onClick={() => setMyRatingToggle(!myRatingToggle)}
        >
          <div className='h-full bg-red-400' 
            id='myRating' 
            style={{width: `${existingReview.myRating}%`, pointerEvents: 'none'}}
          ></div>
        </div>
        <button onClick={() => updateMovieDetails('myRating')}>Update My Rating</button>
      </div>
      }
    </>
  )
}
