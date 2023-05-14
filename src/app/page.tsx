'use client';
import { useState, useEffect } from 'react';
// import { UserButton } from '@clerk/nextjs';
import { v4 as uuidv4 } from 'uuid';

export default function Home() {
  // IF YOU MAKE THIS AN ASYNC FUNCTION SET STATE WILL BREAK THE APP

  // USE OMDBAPI: https://www.omdbapi.com/
  // apikey=8e1df54b
  // Format: http://www.omdbapi.com/?apikey=8e1df54b&<ENTER SEARCH PARAMS HERE>
  // Search Terms:
  //    TITLE/ID LOOK-UP
  //      i=IMDB-ID             Request by specific IMDB-ID, which would probably be pulled from some other request
  //      t=SOMETHING           Request specific title
  //      y=YEAR                Additional param
  //    SEARCHING
  //      s=SOMETHING           Request search of term (returns multiple, use this for searchbar)
  //      y=YEAR                Additional param

  // How to delay fetch until user is done typing: 
  // https://stackoverflow.com/questions/42217121/how-to-start-search-only-when-user-stops-typing

  const [searchTerm, setSearchTerm] = useState('hello');
  const [searchResult, setSearchResult] = useState({ Search: [] });

  useEffect(() => {
    const delaySetState = setTimeout(() => {
      console.log(searchTerm)
      fetch(`http://www.omdbapi.com/?apikey=8e1df54b&s=${searchTerm}`)
          .then((res: any) => res.json())
          .then((data: any) => {
            console.log(data)
            if (data.Response === 'True') {
              console.log('SETTING STATE')
              setSearchResult(data);
            }
          })
    }, 1000)

    return () => clearTimeout(delaySetState)
  }, [searchTerm])

  // This would be a good place to have filters for movies in the list attached to "this" account
  //   For Example: 
  //      - Show recent movies added to my list
  //      - Pick a random movie for me
  //      - Show movies with rating above 6.0 and length less than 120 mins
  
  // const [state, setState] = useState(1);
  // <div>{state}</div>
  // <button onClick={() => setState(state + 1)}>Add</button>
  
  return (
    <div>
      <h1>Home Page</h1>
      <label>SEARCH</label>
      <input className='border-8 border-color-gray-400'
        type='text'
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
      />
      {searchResult.Search.map((item: any) => {
        return (
          <div key={uuidv4()}>
            <hr />
            {JSON.stringify(item.Title)}
            {item.Title}
            <a href={`/movies/${item.imdbID}`}>LINK</a>
          </div>
        )
      })}
    </div>
  )
}
