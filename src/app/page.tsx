'use client';
import { useState } from 'react';
import { UserButton } from '@clerk/nextjs';

export default async function Home() {
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

  // const [searchTerm, setSearchTerm] = useState('');

  //   THIS WORKS, but we dont want to request for every character,
  //   We want to wait a couple seconds after the user stops typing to send the request
  //   See this example for more details: https://stackoverflow.com/questions/42217121/how-to-start-search-only-when-user-stops-typing

  async function search(e: any) {
    console.log(e.target.value);
    // const result = await fetch(`http://www.omdbapi.com/?apikey=8e1df54b&s=${e.target.value}`)
    // if (result.ok) {
    //   console.log(await result.json())
    // } else {
    //   console.log("ERROR WITH REQUEST")
    // }
  }

  return (
    <div>
      <h1>Home Page</h1>
      <UserButton />
      <label>SEARCH</label>
      <input className='border-8 border-color-gray-400'
        type='text' 
        onChange={search}
      />
    </div>
  )
}
