'use client';
import { useState, useEffect } from 'react';

export default function AddToMyList(props: any) {
  // change the default state to null, if state is Null, button should display "Loading your info plz wait"
  const [isMovieAlreadyInMyList, setIsMovieAlreadyInMyList] = useState(null)
  const [refreshTrigger, setRefreshTrigger] = useState(0)

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
      setRefreshTrigger(refreshTrigger + 1)
    }
  }

  async function removeFromMyList() {
    const res = await fetch('/api/myList?' + new URLSearchParams({ imdbId: props.imdbId }), { method: 'DELETE' })
    if (res.ok) {
      setRefreshTrigger(refreshTrigger + 1)
    }
  }

      // {isMovieAlreadyInMyList === true ? <button onClick={removeFromMyList}>REMOVE FROM MY LIST</button> 
      // : isMovieAlreadyInMyList === false ?  <button onClick={addToList}>ADD TO MY LIST</button>
      // : <button>LOADING</button>}

  return (
    <div>
      THIS IS THE ADD TO LIST COMPONENT
      <hr />
      {isMovieAlreadyInMyList === null ? <button>LOADING</button>
      : isMovieAlreadyInMyList ? <button onClick={removeFromMyList}>REMOVE FROM MY LIST</button>
      : <button onClick={addToMyList}>ADD TO MY LIST</button>}
    </div>
  )
}
