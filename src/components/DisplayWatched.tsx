'use client';

import { useState, useEffect } from 'react';
import { watched } from '@prisma/client';
import DisplayMiniMediaInfo from '@/components/DisplayMiniMediaInfo';
import easyFetch from '@/modules/easyFetch';

export default function DisplayWatched() {
  const [watched, setWatched] = useState<watched[] | null>(null)
  const [length, setLength] = useState<number>(5);

  useEffect(() => {
    easyFetch('/api/watched', 'GET', {})
      .then((res: Response) => res.json())
      .then((data: watched[]) => setWatched(data))
  }, []);

  return (
    <div>
      <div className='flex justify-between'>
        <h1>Recently Watched Media:</h1>
        {watched === null ? [] : <h1>You have {watched.length} watch records</h1>}
      </div>
      {watched === null ? <div>Loading...</div> :
        <div className='flex flex-col'>
          {watched.sort((a: watched, b: watched) => b.date - a.date)
            .slice(0, length)
            .map((item: watched) => {
              return <DisplayMiniMediaInfo className='m-2 flex justify-between bg-gray-700 p-4'
                key={item.username + item.imdbID + item.date} 
                imdbID={item.imdbID} 
                display={['Title']} 
                date={item.date}
              />
            })}
          <div className='flex'>
            {length >= watched.length ? [] :
              <button className='p-4 bg-gray-700 m-2 flex-1'
                onClick={() => setLength(length + 5)}
              >MORE</button>
            }
            {length <= 5 ? [] :
              <button className='p-4 bg-gray-700 m-2 flex-1'
                onClick={() => (length - 5) < 5 ? setLength(5) : setLength(length - 5)}
              >LESS</button>
            }
          </div>
        </div>
      }
    </div>
  )
}
