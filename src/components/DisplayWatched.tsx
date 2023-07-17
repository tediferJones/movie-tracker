'use client';

import { useState, useEffect } from 'react';
import easyFetch from '@/modules/easyFetch';
import { watched } from '@prisma/client';
import DisplayMiniMediaInfo from '@/components/DisplayMiniMediaInfo';

export default function DisplayWatched() {
  const [watched, setWatched] = useState<watched[] | null>(null)

  useEffect(() => {
    easyFetch('/api/watched', 'GET', {})
      .then((res: Response) => res.json())
      .then((data: watched[]) => setWatched(data))
  }, []);

  return (
    <div>
      <h1>Recently Watched Media:</h1>
      {watched === null ? <div>Loading...</div> :
        <div className='flex flex-col'>
          {watched.sort((a: watched, b: watched) => b.date - a.date).map((item: watched) => {
            return <DisplayMiniMediaInfo className='m-2 flex justify-between bg-gray-700 p-4'
              key={item.username + item.imdbID + item.date} 
              imdbID={item.imdbID} 
              display={['Title']} 
              date={item.date}
            />
          })}
        </div>
      }
    </div>
  )
}
