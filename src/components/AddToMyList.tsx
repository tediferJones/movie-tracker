'use client';
import { useState, useEffect } from 'react';
import easyFetch from '@/modules/easyFetch';

// RENAME THIS COMPONENT TO ManageList
// consider naming it ManageUserList instead, cuz DisplayLists would be a bit ambigious

export default function AddToMyList(props: any) {
  const [isMovieAlreadyInMyList, setIsMovieAlreadyInMyList] = useState<null | true | false>(null);
  const [refreshTrigger, setRefreshTrigger] = useState<boolean>(true);
  const [myListnames, setMyListnames] = useState<string[]>([]);
  const [currentListname, setCurrentListname] = useState<string>('createNewList')
  const [newListname, setNewListname] = useState<string>('')
  const { imdbID } = props;
  // console.log(imdbID)

  useEffect(() => {
    easyFetch('/api/lists', 'GET', {})
        .then((res: any) => res.json())
        .then((data: any) => {
          setMyListnames(data);
        })
  }, [refreshTrigger])

  // If you can just recieve all the users lists data with one fetchRequest
  // then we could probably get away with only one fetch request

  useEffect(() => {
    easyFetch('/api/lists', 'GET', { imdbID, listname: currentListname })
        .then((res: any) => res.json())
        .then((data: any) => {
          console.log('FETCH WITH IMDBID AND LISTNAME')
          console.log(data)
          setIsMovieAlreadyInMyList(data ? true : false)
        })
  }, [currentListname, refreshTrigger])

  async function addToMyList(e: any) {
    e.preventDefault();
    // console.log(e.target.listname.value);
    let listname;

    if (currentListname === 'createNewList') {
      listname = newListname;
    } else {
      listname = e.target.listname.value
    }

    setIsMovieAlreadyInMyList(null);
    await easyFetch('/api/lists', 'POST', { listname: listname, imdbID })
    setRefreshTrigger(!refreshTrigger)
  }

  async function removeFromMyList(e: any) {
    e.preventDefault();
    
    const listname = e.target.listname.value;
    if (listname === 'createNewList') {
      setIsMovieAlreadyInMyList(null);
      await easyFetch('/api/lists', 'DELETE', { listname: e.target.listname.value, imdbID })
      setRefreshTrigger(!refreshTrigger)
    } else {
      console.log('No list selected, cant delete from nothing')
    }
  }

  function dropDownHandler(e: any) {
    console.log(e.target.value);
    setIsMovieAlreadyInMyList(null);
    setCurrentListname(e.target.value)
  }

  function newListnameHandler(e: any) {
    console.log(e);
    setNewListname(e.target.value);
  }

  return (
    <div>
      THIS IS THE ADD TO LIST COMPONENT
      <hr />
      <div>{JSON.stringify(currentListname)}</div>
      <div className='p-4 bg-orange-400'>
        <form onSubmit={isMovieAlreadyInMyList ? removeFromMyList : addToMyList}>
          <div>Dont make your listname createNewList, that would cause problems</div>
          <label htmlFor='listname'>Select existing list:</label>
          <select name='listname' onChange={dropDownHandler}>
            <option key='createNewList' value='createNewList'>Create New List</option>
            {myListnames.map((listname: string) => {
              return (
                <option key={listname} value={listname}>{listname}</option>
              )
            })}
          </select>

          {currentListname !== 'createNewList' ? [] :
            <div>
              <label htmlFor='newListname'>Create new list:</label>
              <input id='newListname' 
                name='newListname' 
                type='text' 
                value={newListname} 
                onChange={newListnameHandler}
              />
            </div>
          }

          {isMovieAlreadyInMyList === null ? <div>Loading...</div>
          : isMovieAlreadyInMyList ? <button>Remove movie from this list</button> 
          : <button className='p-2 bg-blue-700 text-white'>ADD THIS imdbID TO THIS listname</button>
          }
        </form>
      </div>
    </div>
  )
}
