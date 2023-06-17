'use client';

import { useEffect, useState } from 'react';
import { movieDetails } from '@/types';
import easyFetch from '@/modules/easyFetch';

// RENAME THIS COMPONENT TO ManageReview
// And then also change all variable names in this file, the names are confusing
// Change all occurences of 'Details' to 'Review'

export default function EditListDetails(props: any) {
  const { imdbID } = props;
  // const [listDetails, setListDetails] = useState<null | movieDetails>(null);
  const [refreshTrigger, setRefreshTrigger] = useState<boolean>(false);

  const [myRating, setMyRating] = useState<number>(0);
  const [myRatingToggle, setMyRatingToggle] = useState<boolean>(false);

  // this component is pretty convulted, try to simplify it
  // Easiest method: dont post single attrs to the DB, use defaultState var to send all data at once
  // This var should be held in state, update the attrs instead of giving myRating its own state
  const defaultState = {
    username: '',
    imdbID,
    watchAgain: false,
    myRating: 0,
  }
  // assign null by default, if useEffect var 'data' is null, assign default state
  // This provides a loading state which we want
  const [listDetails, setListDetails] = useState<movieDetails>(defaultState);

  useEffect(() => {
    easyFetch('/api/reviews', 'GET', { imdbID })
        .then((res: Response) => res.json())
        .then((data: any) => {
          if (data) {
            setListDetails(data);
            setMyRating(data.myRating);
          }
        })
  }, [refreshTrigger])

  // Each attribute we want to toggle should have its own button, 
  // the contents and function of which should change depending on its state,
  // after each change, use a refresh trigger to get the new results posted to the DB

  async function updateMovieDetails(movieDetailKey: string) {
    let movieDetailValue: boolean | number;
    if (['watchAgain'].includes(movieDetailKey)) {
      movieDetailValue = !listDetails[movieDetailKey]
      console.log(movieDetailValue)
    } else {
      movieDetailValue = myRating;
    }
    const fetchMethod = listDetails.username === '' ? 'POST' : 'PUT'
    await easyFetch('/api/reviews', fetchMethod, { movieDetailKey, movieDetailValue, imdbID })
    setRefreshTrigger(!refreshTrigger);
  }

  function sliderHandler(e: any) {
    if (myRatingToggle) {
      document.getElementById('HoverText')?.remove()
      setMyRating(Math.round(e.nativeEvent.offsetX / e.target.offsetWidth * 100))
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

  // ADD BUTTON TO DELETE REVIEW, route already exists in API, but it is essentially empty
  // We still need some kind of loading state, while we check the DB to see if a review exists

  return (
    <>
      {/* {!listDetails ? <h1>Loading your data...</h1> :} */}
      <div className='bg-yellow-400'>
        <div>{JSON.stringify(listDetails)}</div>
        <button onClick={() => updateMovieDetails('watchAgain')}>Toggle Watch Again</button>
        <hr />

        <label htmlFor='myRating'>myRating</label>
        <input className='border-4'
          name='myRating'
          value={(myRating / 20).toFixed(2)} 
          onChange={(e: any) => setMyRating(e.target.value * 20)} 
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
            style={{width: `${myRating}%`, pointerEvents: 'none'}}
          ></div>
        </div>
        <button onClick={() => updateMovieDetails('myRating')}>Update My Rating</button>
      </div>
      
    </>
  )
}
