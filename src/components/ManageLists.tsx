'use client';
import { useState, useEffect, FormEvent, ChangeEvent } from 'react';
import { userLists } from '@/types';
import easyFetch from '@/modules/easyFetch';

export default function ManageLists({ imdbID }: { imdbID: string }) {
  const [currentList, setCurrentList] = useState<string>('');
  const [userLists, setUserLists] = useState<{ [key: string]: string[] } | null>(null);
  const [refreshTrigger, setRefreshTrigger] = useState<boolean>(false);

  useEffect(() => {
    easyFetch('/api/lists', 'GET')
      .then((data: userLists) => {
        console.log('USER LISTS', data)
        setUserLists(data.lists)
        data.defaultListname ? setCurrentList(data.defaultListname) : setCurrentList(Object.keys(data.lists)[0])
      });
  }, [refreshTrigger]);

  function mediaExistsInCurrentList(): true | false {
    if (userLists && Array.isArray(userLists[currentList])) {
      return userLists[currentList].includes(imdbID)
    }
    return false;
  }

  function mediaExistsInAnyList(): true | false {
    return userLists === null ? false : Object.keys(userLists).map((key: string) => userLists[key].includes(imdbID)).includes(true)
  }

  async function submitHandler(e: FormEvent) {
    e.preventDefault();
    if (currentList) {
      if (mediaExistsInCurrentList()) {
        await easyFetch('/api/lists', 'DELETE', { listname: currentList, imdbID })
      } else {
        await easyFetch('/api/lists', 'POST', { listname: currentList, imdbID })
      }
      setRefreshTrigger(!refreshTrigger);
    }
  }

  function deleteFuncCreator(key: string) {
    return async function() {
      await easyFetch('/api/lists', 'DELETE', { listname: key, imdbID });
      setRefreshTrigger(!refreshTrigger);
    }
  } 

  return (
    <form className='flex h-full max-h-[75vh] flex-col justify-between bg-gray-700 p-4'
      onSubmit={submitHandler}
    > <div className='mb-2 flex flex-wrap justify-between gap-2'>
        <h1 className='text-xl'>Manage My Lists</h1>
        <select className='text-black flex-1' 
          value={currentList} 
          onChange={(e: ChangeEvent<HTMLSelectElement>) => setCurrentList(e.target.value)}
        > <option value=''>Create List</option>
          {userLists === null ? [] : Object.keys(userLists).map((userList: string) => {
            return (
              <option key={userList} value={userList}>{userList}</option>
            )
          })}
        </select>
      </div>

      <div className='overflow-y-auto'>
        {userLists === null ? <h1 className='text-center'>Loading...</h1> 
          : !mediaExistsInAnyList() ? <h1 className='text-center my-2'>This Media does not exist in any of your lists</h1> 
            : Object.keys(userLists).map((key: string) => {
              if (userLists[key].includes(imdbID)) {
                return (
                  <div className='my-2 flex justify-between bg-gray-200 p-2 text-black flex-wrap gap-2'
                    key={key}
                  > <p className='m-auto text-center flex-[2]'>{key}</p>
                    <button className='bg-red-600 p-2 text-white flex-1' type='button' onClick={deleteFuncCreator(key)}>Delete</button>
                  </div>
                )
              }
            })}
      </div>

      <div className='flex flex-col'>
        {userLists === null || Object.keys(userLists).includes(currentList) ? [] 
            : <input className='my-2 p-2 text-xl text-black'
              type='text' 
              required={true} 
              value={currentList} 
              onChange={(e: ChangeEvent<HTMLInputElement>) => setCurrentList(e.target.value)}
            /> 
        }

        {mediaExistsInCurrentList() ? <button className='mt-2 bg-orange-400 p-4' type='submit'>Delete Movie</button> 
          : <button className='mt-2 bg-orange-400 p-4' type='submit'>Add Movie</button>}
      </div>
    </form>
  )
}
