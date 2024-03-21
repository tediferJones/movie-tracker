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
        setUserLists(data.lists)
        setCurrentList(data.defaultListname ? data.defaultListname : Object.keys(data.lists)[0])
      });
  }, [refreshTrigger]);

  function mediaExistsInCurrentList(): boolean {
    if (userLists && Array.isArray(userLists[currentList])) {
      return userLists[currentList].includes(imdbID)
    }
    return false;
  }

  function mediaExistsInAnyList(): boolean {
    return userLists === null ? false : Object.keys(userLists).map((key: string) => userLists[key].includes(imdbID)).includes(true)
  }

  return (
    <form className='flex h-full max-h-[75vh] flex-col justify-between bg-gray-700 p-4'
      onSubmit={async (e: FormEvent) => {
        e.preventDefault();
        if (currentList) {
          await easyFetch('/api/lists', 
            mediaExistsInCurrentList() ? 'DELETE' : 'POST', 
            { listname: currentList, imdbID }
          )
          setRefreshTrigger(!refreshTrigger);
        }
      }}
    > <div className='mb-2 flex flex-wrap justify-between gap-2'>
        <h1 className='text-xl'>Manage My Lists</h1>
        <select className='flex-1 text-black' 
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
          : !mediaExistsInAnyList() ? <h1 className='my-2 text-center'>This Media does not exist in any of your lists</h1> 
            : Object.keys(userLists).map((key: string) => {
              if (userLists[key].includes(imdbID)) {
                return (
                  <div className='my-2 flex flex-wrap justify-between gap-2 bg-gray-200 p-2 text-black'
                    key={key}
                  > <p className='m-auto flex-[2] text-center'>{key}</p>
                    <button className='flex-1 bg-red-600 p-2 text-white' 
                      type='button' 
                      onClick={async () => {
                        await easyFetch('/api/lists', 'DELETE', { listname: key, imdbID });
                        setRefreshTrigger(!refreshTrigger);
                      }}
                    >Delete</button>
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
