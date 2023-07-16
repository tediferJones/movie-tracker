'use client';

import { useState, useEffect } from 'react';
import easyFetch from '@/modules/easyFetch';
import { watched } from '@prisma/client';
import DisplayMiniMediaInfo from './DisplayMiniMediaInfo';

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
        <div className='flex flex-wrap'>
          {watched.sort((a: watched, b: watched) => b.date - a.date).map((item: watched) => {
            return (
              <div key={item.username + item.imdbID + item.date } className='w-full m-4 p-4 bg-gray-700'>
                <DisplayMiniMediaInfo imdbID={item.imdbID} display={['Title']} date={item.date}/>
              </div>
            )
          })}
        </div>
      }
    </div>
  )
}
