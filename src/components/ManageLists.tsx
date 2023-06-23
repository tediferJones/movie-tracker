'use client';
import { useState, useEffect, FormEvent, ChangeEvent } from 'react';
import easyFetch from '@/modules/easyFetch';

export default function ManageLists(props: { imdbID: string }) {
  const { imdbID } = props;
  const [currentList, setCurrentList] = useState<string>('');
  const [userLists, setUserLists] = useState<{ [key: string]: string[] }>({});
  const [refreshTrigger, setRefreshTrigger] = useState<boolean>(false);

  useEffect(() => {
    easyFetch('/api/lists', 'GET', {})
        .then((res: Response) => res.json())
        .then((data: { [key: string]: string[] }) => {
          console.log('FETCHING NEW DATA')
          console.log('USER LISTS', data)
          setUserLists(data)
          if (Object.keys(data).length > 0) {
            // Set default list
            setCurrentList(Object.keys(data)[0])
          }
        });
  }, [refreshTrigger]);

  function mediaExistsInCurrentList(): true | false {
    // Maybe use Array.isArray, cuz we should actually be making sure its an array before using .includes
    if (Array.isArray(userLists[currentList])) {
      return userLists[currentList].includes(imdbID)
    }
    return false;
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

  return (
    <form className='flex h-full flex-col justify-between bg-gray-700 p-4'
      onSubmit={submitHandler}
    > <div className='mb-2 flex justify-between'>
        <h1 className='text-xl'>Manage My Lists</h1>
        <select className='text-black' value={currentList} onChange={(e: ChangeEvent<HTMLSelectElement>) => setCurrentList(e.target.value)}>
          <option value=''>Create List</option>
          {Object.keys(userLists).map((userList: string) => {
            return (
              <option key={userList} value={userList}>{userList}</option>
            )
          })}
        </select>
      </div>

      {Object.keys(userLists).map((key: string) => {
        if (userLists[key].includes(imdbID)) {
          return (
            <div className='my-2 flex justify-between bg-gray-200 p-2 text-black'>
              <p className='m-auto'>{key}</p>
              <button className='bg-red-600 p-2 text-white' type='button' onClick={() => console.log('delete button')}>Delete</button>
            </div>
          )
        }
      })}

      {Object.keys(userLists).includes(currentList) ? [] 
        : <input className='my-2 p-2 text-xl text-black'
          type='text' 
          required={true} 
          value={currentList} 
          onChange={(e: ChangeEvent<HTMLInputElement>) => setCurrentList(e.target.value)}
        /> 
      }

      {mediaExistsInCurrentList() ? <button className='mt-2 bg-orange-400 p-4' type='submit'>Delete Movie</button> 
          : <button className='mt-2 bg-orange-400 p-4' type='submit'>Add Movie</button>}
    </form>
  )
}
