'use client';
import { useState, useEffect } from 'react';

export default function AddToMyList(props: any) {
  const [isMovieAlreadyInMyList, setIsMovieAlreadyInMyList] = useState<null | true | false>(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  // refresh trigger is just a toggle, dont use int + 1, make it a boolean and just setRefreshTrigger(!theOldValue)
  const { imdbID } = props;
  console.log(imdbID)
  // go back to movies/[id], fix how the props are sent
  // also go to /api/lists and fix how they are received

  useEffect(() => {
    fetch('/api/lists?' + new URLSearchParams({ imdbID}))
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
      setRefreshTrigger(refreshTrigger + 1)
    }
  }

  async function removeFromMyList() {
    const res = await fetch('/api/lists?' + new URLSearchParams({ imdbID }), { method: 'DELETE' })
    if (res.ok) {
      setIsMovieAlreadyInMyList(null);
      setRefreshTrigger(refreshTrigger + 1)
    }
  }

  const buttonClasses = 'p-4 bg-gray-200';
  // Rewrite this, it should just be one big button with a ternary for onClick and the HTML text
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
