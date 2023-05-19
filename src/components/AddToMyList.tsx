'use client';
import { useState, useEffect } from 'react';

export default function AddToMyList(props: any) {
  const [isMovieAlreadyInMyList, setIsMovieAlreadyInMyList] = useState<null | true | false>(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  useEffect(() => {
    fetch('/api/myList?' + new URLSearchParams({ imdbId: props.imdbId }))
        .then((res: any) => res.json())
        .then((data: any) => setIsMovieAlreadyInMyList(data.exists))
  }, [refreshTrigger]);

  async function addToMyList() {
    const res = await fetch('/api/myList', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ imdbId: props.imdbId })
    })
    if (res.ok) {
      setIsMovieAlreadyInMyList(null);
      setRefreshTrigger(refreshTrigger + 1)
    }
  }

  async function removeFromMyList() {
    const res = await fetch('/api/myList?' + new URLSearchParams({ imdbId: props.imdbId }), { method: 'DELETE' })
    if (res.ok) {
      setIsMovieAlreadyInMyList(null);
      setRefreshTrigger(refreshTrigger + 1)
    }
  }

  const buttonClasses = 'p-4 bg-gray-200';
  return (
    <div>
      THIS IS THE ADD TO LIST COMPONENT
      <hr />
      {isMovieAlreadyInMyList === null ? <button className={buttonClasses}>LOADING</button>
      : isMovieAlreadyInMyList ? <button className={buttonClasses} onClick={removeFromMyList}>REMOVE FROM MY LIST</button>
      : <button className={buttonClasses} onClick={addToMyList}>ADD TO MY LIST</button>}
    </div>
  )
}
