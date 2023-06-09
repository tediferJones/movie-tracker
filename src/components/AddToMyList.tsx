'use client';
import { useState, useEffect } from 'react';
import easyFetch from '@/modules/easyFetch';

// RENAME THIS COMPONENT TO ManageList
// consider naming it ManageUserList instead, cuz DisplayLists would be a bit ambigious

export default function AddToMyList(props: any) {
  const [isMovieAlreadyInMyList, setIsMovieAlreadyInMyList] = useState<null | true | false>(null);
  const [refreshTrigger, setRefreshTrigger] = useState<boolean>(true);
  const [myListnames, setMyListnames] = useState<string[]>([]);
  const { imdbID } = props;
  // console.log(imdbID)

  // REFORMATING
  // 1. get all listnames associated with user
  // 2. create a selector with these names as options
  // 3. Get POST request working
  //
  // USE A SEPERATE FORM TO ADD A NEW LIST
  // Have a button that will replace the drop down with a text box,
  // Use the text in this box to create a record with a new listname and whatever imdbID

  useEffect(() => {
    easyFetch('/api/lists', 'GET', {})
        .then((res: any) => res.json())
        .then((data: any) => setMyListnames(data))
  }, [])

  // useEffect(() => {
  //   easyFetch('/api/lists', 'HEAD', { imdbID })
  //       .then((res: any) => res.status)
  //       .then((status: number) => setIsMovieAlreadyInMyList(status === 200 ? true : false))
  // }, [refreshTrigger]);

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
      <hr />
      <div className='p-4 bg-orange-400'>
        <label htmlFor='listname'>Select existing list:</label>
        <select name='listname'>
          {myListnames.map((listname: string) => {
            return (
              <option key={listname} value={listname}>{listname}</option>
            )
          })}
        </select>

        <label htmlFor='newListname'>Create new list:</label>
        <input name='newListname' type='text'/>

        <button className='p-2 bg-blue-700 text-white'>ADD THIS imdbID TO THIS listname</button>
      </div>
    </div>
  )
}
