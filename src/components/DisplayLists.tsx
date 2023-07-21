'use client';

import { useEffect, useState } from 'react';
import { userLists } from '@/types';
import DisplayMiniMediaInfo from '@/components/DisplayMiniMediaInfo';
import DisplayDropDown from '@/components/DisplayDropDown';
import easyFetch from '@/modules/easyFetch';

export default function DisplayLists({ username }: { username: string }) {
  const [userLists, setUserLists] = useState<{ [key: string]: string[] }>({})
  
  useEffect(() => {
    easyFetch('/api/lists', 'GET', { username })
      .then((data: userLists) => setUserLists(data.lists))
  }, []);

  function listItems(listname: string): JSX.Element[] {
    return userLists[listname].map((imdbID: string) => {
      return <DisplayMiniMediaInfo className='flex p-4' 
        key={imdbID} 
        imdbID={imdbID} 
        display={['Title', 'Poster']}
      />
    })
  }

  return (
    <div>
      <h1>{username}'s List</h1>
      {Object.keys(userLists).map((listname: string) => {
        return <DisplayDropDown header={listname} 
          content={listItems(listname)} 
          username={username} 
          key={listname}
        />
      })}
    </div>
  )
}
