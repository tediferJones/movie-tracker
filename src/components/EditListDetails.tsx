'use client';

import { useEffect, useState } from 'react';
import { movieDetails } from '@/types';
import easyFetch from '@/modules/easyFetch';

export default function EditListDetails(props: any) {
  const { imdbID } = props;
  // consider using null to hold loading state, i.e. when listDetails === null => display loading dialog
  const [listDetails, setListDetails] = useState<null | movieDetails>(null);
  const [refreshTrigger, setRefreshTrigger] = useState<boolean>(false);

  const [myRating, setMyRating] = useState<number>(0);
  const [myRatingToggle, setMyRatingToggle] = useState<boolean>(false);

  useEffect(() => {
    easyFetch('/api/lists', 'GET', { imdbID })
        .then((res: any) => res.json())
        .then((data: any) => {
          setListDetails(data);
          setMyRating(data.myRating);
        })
  }, [refreshTrigger])

  // Each attribute we want to toggle should have its own button, 
  // the contents and function of which should change depending on its state,
  // after each change, use a refresh trigger to get the new results posted to the DB

  async function updateMovieDetails(movieDetailKey: string) {
    // console.log(e, movieDetailKey)
    if (listDetails) {
      let movieDetailValue: boolean | number;
      if (['watched', 'watchAgain'].includes(movieDetailKey)) {
        movieDetailValue = !listDetails[movieDetailKey]
      } else {
        movieDetailValue = myRating;
      }
      await easyFetch('/api/lists', 'PUT', { movieDetailKey, movieDetailValue, imdbID })
      setRefreshTrigger(!refreshTrigger);
    }
  }

  // Use listDetails to assign default myRating value
  function sliderHandler(e: any) {
    if (myRatingToggle) {
      setMyRating(Math.round(e.nativeEvent.offsetX / e.target.offsetWidth * 100))
    }
    // else {
    //   console.log('myRatingToggle is FALSE')
    //   console.log(document.getElementById('myRatingParent'))
    // }
  }

  function mouseEnter() {
    const newDiv = document.createElement('div');
    newDiv.id = 'HoverText'
    newDiv.innerHTML = 'Click to Edit'
    newDiv.style.position = 'absolute';
    document?.getElementById('myRatingParent')?.prepend(newDiv)
  }

  function mouseLeave() {
    document.getElementById('HoverText')?.remove();
  }
 
  // const hoverText = <div id='HoverText' style={{position: 'absolute'}}>Click to Edit</div>

  return (
    <>
      {!listDetails ? <h1>Loading your data...</h1> :
      <div>
        <div>{JSON.stringify(listDetails)}</div>
        <button onClick={() => updateMovieDetails('watched')}>Toggle Watched</button>
        <hr />
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
          onMouseEnter={myRatingToggle ? undefined : mouseEnter}
          onMouseLeave={myRatingToggle ? undefined : mouseLeave}
          onClick={() => {
            if (myRatingToggle) {
              mouseEnter()
            } else {
              document.getElementById('HoverText')?.remove(); 
            }
            setMyRatingToggle(!myRatingToggle); 
          }}
        >
          <div className='h-full bg-red-400' 
            id='myRating' 
            style={{width: `${myRating}%`, pointerEvents: 'none'}}
          ></div>
        </div>
        <button onClick={() => updateMovieDetails('myRating')}>Update My Rating</button>
      </div>
      }
    </>
  )
}
