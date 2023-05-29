'use client';
import { useState, useEffect } from 'react';

export default function AddToMyList(props: any) {
  const [isMovieAlreadyInMyList, setIsMovieAlreadyInMyList] = useState<null | true | false>(null);
  const [refreshTrigger, setRefreshTrigger] = useState<boolean>(true);
  const { imdbID } = props;
  // console.log(imdbID)

  useEffect(() => {
    fetch('/api/lists?' + new URLSearchParams({ imdbID }))
        .then((res: any) => res.json())
        .then((data: any) => setIsMovieAlreadyInMyList(data.exists))
  }, [refreshTrigger]);

  async function addToMyList() {
    const res = await fetch('/api/lists', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ imdbID })
    })
    if (res.ok) {
      setIsMovieAlreadyInMyList(null);
      setRefreshTrigger(!refreshTrigger)
    }
  }

  async function removeFromMyList() {
    const res = await fetch('/api/lists?' + new URLSearchParams({ imdbID }), { method: 'DELETE' })
    if (res.ok) {
      setIsMovieAlreadyInMyList(null);
      setRefreshTrigger(!refreshTrigger)
    }
  }

  const buttonClasses = 'p-4 bg-gray-200';

  return (
    <div>
      THIS IS THE ADD TO LIST COMPONENT
      <hr />
      <button 
        className={buttonClasses}
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
