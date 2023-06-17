'use client';
import { useState, useEffect } from 'react';
import easyFetch from '@/modules/easyFetch';

export default function ManageLists(props: any) {
  const { imdbID } = props;
  const [currentList, setCurrentList] = useState<string>('');
  const [userLists, setUserLists] = useState<{ [key: string]: string[] }>({});
  const [refreshTrigger, setRefreshTrigger] = useState<boolean>(false);

  useEffect(() => {
    easyFetch('/api/lists', 'GET', {})
        .then((res: Response) => res.json())
        .then((data: { [key: string]: string[] }) => {
          console.log('FETCHING NEW DATA')
          setUserLists(data)
          if (Object.keys(data).length > 0) {
            // Set default list
            setCurrentList(Object.keys(data)[0])
          }
        });
  }, [refreshTrigger]);

  function movieExistsInList(): true | false {
    // Maybe use Array.isArray, cuz we should actually be making sure its an array before using .includes
    if (userLists[currentList]) {
      return userLists[currentList].includes(imdbID)
    }
    return false;
  }

  async function submitHandler(e: any) {
    e.preventDefault();
    if (currentList) {
      if (movieExistsInList()) {
        await easyFetch('/api/lists', 'DELETE', { listname: currentList, imdbID })
      } else {
        await easyFetch('/api/lists', 'POST', { listname: currentList, imdbID })
      }
      setRefreshTrigger(!refreshTrigger);
    }
  }

  return (
    <div className='p-8 bg-orange-400'>
      {imdbID}
      <hr />
      {JSON.stringify(userLists)}
      <hr />
      {currentList}
      <hr />
      <form onSubmit={submitHandler} id='test'>
        <select value={currentList} onChange={(e: any) => setCurrentList(e.target.value)}>
          <option value=''>NewList</option>
          {Object.keys(userLists).map((userList: string) => {
            return (
              <option key={userList} value={userList}>{userList}</option>
            )
          })}
        </select>

        {Object.keys(userLists).includes(currentList) ? [] 
        : <input type='text' 
            required={true} 
            value={currentList} 
            onChange={(e: any) => setCurrentList(e.target.value)}
          /> 
        }

        {currentList === '' ? <div>Please Enter a List Name</div>
        : movieExistsInList() ? <button>Delete Movie</button> 
        : <button>Add Movie</button>}
      </form>
    </div>
  )
}
