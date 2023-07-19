'use client';

import { useEffect, useState } from 'react';
import { userLists } from '@/types';
import DisplayDropDown from '@/components/DisplayDropDown';
import easyFetch from '@/modules/easyFetch';

export default function DisplayLists({ username }: { username: string }) {
  const [userLists, setUserLists] = useState<{ [key: string]: string[] }>({})
  
  useEffect(() => {
    easyFetch('/api/lists', 'GET', { username })
      .then((res: Response) => res.json())
      .then((data: userLists) => setUserLists(data.lists))
  }, []);

  return (
    <div>
      <h1>{username}'s List</h1>
      {Object.keys(userLists).map((listname: string) => {
        return (
          <div key={listname} className='bg-gray-700 m-4 p-4'>
            <DisplayDropDown header={listname} content={userLists[listname]} username={username} />
          </div>
        )
      })}
    </div>
  )
}
