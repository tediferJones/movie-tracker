'use client';
import { useState, useEffect } from 'react';
// import { UserButton } from '@clerk/nextjs';
import { v4 as uuidv4 } from 'uuid';
import { omdbSearch, omdbSearchResult } from '@/types';

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

  const defaultState: omdbSearch = {
    Search: [],
    Response: 'False',
    totalResults: '0',
  }

  const [searchTerm, setSearchTerm] = useState('The Deluge');
  const [searchResult, setSearchResult] = useState(defaultState);

  useEffect(() => {
    const delaySetState = setTimeout(() => {
      console.log(searchTerm)
      fetch(`http://www.omdbapi.com/?apikey=8e1df54b&s=${searchTerm}`)
          .then((res: any) => res.json())
          .then((data: omdbSearch) => {
            console.log(data)
            if (data.Response === 'True') {
              console.log('SETTING STATE')
              setSearchResult(data);
            } else {
              setSearchResult(defaultState);
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
    <div className='flex flex-col items-center'>
      <div className='w-4/5 flex'>
        <label className='flex justify-center items-center'>SEARCH</label>
        <div className='flex-1 flex flex-col'>
          <input className='flex-1 text-2xl border-8 border-color-gray-400'
            type='text'
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          {searchResult.Search.map((item: omdbSearchResult) => {
            return (
              <div className='flex justify-between'
                key={uuidv4()}
              >
                <p className='flex-[2]'>{item.Title}</p>
                <p className='flex-1'>{item.Year}</p>
                <a className='flex-1' 
                  href={`/movies/${item.imdbID}`}
                >LINK</a>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
