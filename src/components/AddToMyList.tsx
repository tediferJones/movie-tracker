'use client';
import { useState, useEffect } from 'react';
import easyFetch from '@/modules/easyFetch';

export default function AddToMyList(props: any) {
  const [isMovieAlreadyInMyList, setIsMovieAlreadyInMyList] = useState<null | true | false>(null);
  const [refreshTrigger, setRefreshTrigger] = useState<boolean>(true);
  const { imdbID } = props;
  // console.log(imdbID)

  useEffect(() => {
    easyFetch('/api/lists', 'GET', { imdbID })
        .then((res: any) => res.json())
        .then((data: any) => setIsMovieAlreadyInMyList(data.exists))
  }, [refreshTrigger]);

  async function addToMyList() {
    setIsMovieAlreadyInMyList(null);
    await easyFetch('/api/lists', 'POST', { imdbID })
    setRefreshTrigger(!refreshTrigger)
  }

  async function removeFromMyList() {
    setIsMovieAlreadyInMyList(null);
    await easyFetch('/api/lists', 'DELETE', { imdbID })
    setRefreshTrigger(!refreshTrigger)
  }

  return (
    <div>
      THIS IS THE ADD TO LIST COMPONENT
      <hr />
      <button 
        className={'p-4 bg-gray-200'}
        onClick={
          isMovieAlreadyInMyList === null ? undefined 
          : isMovieAlreadyInMyList ? removeFromMyList
          : addToMyList
        }
      >{isMovieAlreadyInMyList === null ? 'Loading...'
      : isMovieAlreadyInMyList ? 'Remove From My List'
      : 'Add To My List'}</button>
    </div>
  )
}
