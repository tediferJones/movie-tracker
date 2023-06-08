'use client';

import { useEffect, useState } from 'react';
import { movieDetails } from '@/types';
import easyFetch from '@/modules/easyFetch';

export default function ToggleListDetails(props: any) {
  const { imdbID } = props;
  // consider using null to hold loading state, i.e. when listDetails === null => display loading dialog
  const [listDetails, setListDetails] = useState<null | movieDetails>(null);
  const [refreshTrigger, setRefreshTrigger] = useState<boolean>(false);

  useEffect(() => {
    easyFetch('/api/lists', 'GET', { imdbID })
        .then((res: any) => res.json())
        .then((data: any) => setListDetails(data))
  }, [refreshTrigger])

  // Each attribute we want to toggle should have its own button, 
  // the contents and function of which should change depending on its state,
  // after each change, use a refresh trigger to get the new results posted to the DB

  async function toggleMovieDetails(e: any) {
    // Try to not depend on html value attribute, 
    // is there any other way to dynamically assign object keys
    
    // This method only works for boolean values, how are we going to update user rating?
    // Solution: Create a different function for movieDetails that CANNOT be toggled

    if (listDetails) {
      let movieDetailKey = e.target.value;
      let movieDetailValue = !listDetails[movieDetailKey];
      await easyFetch('/api/lists', 'PUT', { movieDetailKey, movieDetailValue, imdbID })
      setRefreshTrigger(!refreshTrigger);
    }
  }

  // const [width, setWidth] = (320)
  // myRating should only be assign numbers between 1 and 5 with a step of 0.05
  // Nah just make it zero to one hundred, thats how we're gunna store it in the DB anyways
  const [myRating, setMyRating] = useState<number>(10)
  async function test(e: any) {
    e.preventDefault();
    console.log(e)
    // console.log(e.clientX, e.clientY)
    // console.log(e.nativeEvent.offsetX, e.nativeEvent.offsetY)
    // console.log(e.target.clientWidth)
    // console.log(e.nativeEvent.offsetX)

    // console.log(e.movementX)
    // setMyRating(myRating + e.movementX)

    // console.log(e.nativeEvent.offsetX)
    // console.log(e.target.clientWidth)
    // console.log(e.pageX)
    // const idk = document.getElementById('myRating');
    // console.log(idk);
    console.log(e.nativeEvent.offsetX)
    console.log(e.target.parentElement.offsetWidth)
    console.log(e.nativeEvent.offsetX / e.target.offsetWidth * 100)
    setMyRating(Math.round(e.nativeEvent.offsetX / e.target.offsetWidth * 100))
    // setMyRating(e.nativeEvent.offsetX / e.target.parentElement.offsetWidth * 100)
  }

  // function testInside(e: any) {
  //   console.log(e.target.parentElement.offsetX)
  //   console.log(e.target.parentElement.offsetWidth)
  // }

  return (
    <div>
      <h1>This is the ToggleListDetails Component</h1>
      {!listDetails ? [] :
        <div>{JSON.stringify(listDetails)}</div>
      }
      <button onClick={toggleMovieDetails} value='watched'>Toggle Watched</button>
      <button onClick={toggleMovieDetails} value='watchAgain'>Toggle Watch Again</button>
      <label htmlFor='myRating'>myRating</label>
      <input name='myRating' value={(myRating / 20).toFixed(2)} className='border-4' type='number' min={0} max={5} step={0.05} />

      <h1>{myRating / 20}</h1>
      <div className='m-24 w-1/2'>
        <div className='h-[64px] bg-blue-400' onMouseMove={test}>
          <div id='myRating' className='h-[32px] bg-red-400' style={{width: `${myRating}%`}}></div>
        </div>
      </div>
    </div>
  )
}
