'use client';
import { useState, useEffect } from 'react';
import easyFetch from '@/modules/easyFetch';
import EditListDetails from '@/components/EditListDetails';

export default function AddToMyList(props: any) {
  const [isMovieAlreadyInMyList, setIsMovieAlreadyInMyList] = useState<null | true | false>(null);
  const [refreshTrigger, setRefreshTrigger] = useState<boolean>(true);
  const { imdbID } = props;
  // console.log(imdbID)

  useEffect(() => {
    easyFetch('/api/lists', 'HEAD', { imdbID })
        .then((res: any) => res.status)
        .then((status: number) => setIsMovieAlreadyInMyList(status === 200 ? true : false))
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
      : 'Add To My List'}
      </button>
      {!isMovieAlreadyInMyList ? [] : <EditListDetails imdbID={imdbID}/> }
    </div>
  )
}
