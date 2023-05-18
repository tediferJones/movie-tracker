'use client';
import { useState, useEffect } from 'react';

export default function AddToMyList(props: any) {
  const [isMovieAlreadyInMyList, setIsMovieAlreadyInMyList] = useState(true)

  useEffect(() => {
    fetch('/api/myList/check', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ userId: props.userId, imdbId: props.imdbId })
    }).then((res: any) => res.json())
      .then((data: any) => setIsMovieAlreadyInMyList(data.exists))
  }, []);

  // TO-DO
  // get button to toggle between add and remove, using the state defined above;
  // The button will switch from add to remove if we delete the page,
  // But we want it to refresh after we click the button
  // SOLUTION: add some state object to the useEffect dependency array
  // BUT dont make that object the isMovieAlreadyInMyList var, that will cause an infinite loop

  async function addToList() {
    // we need to fetch to an api endpoint to post data
    const res = await fetch('/api/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ imdbId: props.imdbId, userId: props.userId })
    })
    console.log(res);
  }

  async function removeFromMyList() {
    const res = await fetch('/api/myList/delete', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ userId: props.userId, imdbId: props.imdbId })
    })
    console.log(res);
  }

  // IF THIS MOVIE ALREADY EXISTS IN THE USER'S LIST
  // Then disable the button and change it to say something like 'Movie Already in List'

  return (
    <div>
      THIS IS THE ADD TO LIST COMPONENT
      <hr />
      {isMovieAlreadyInMyList ? 
        <button onClick={removeFromMyList}>REMOVE FROM MY LIST</button> :
        <button onClick={addToList}>ADD TO MY LIST</button>}
    </div>
  )
}
