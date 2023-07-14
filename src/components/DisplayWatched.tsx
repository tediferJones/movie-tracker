'use client';

import { useState, useEffect } from 'react';
import easyFetch from '@/modules/easyFetch';
import { watched } from '@prisma/client';
import DisplayMiniMediaInfo from './DisplayMiniMediaInfo';

export default function DisplayWatched() {

  const [watched, setWatched] = useState<watched[] | null>(null)

  useEffect(() => {

    console.log('fetch watched records')
    easyFetch('/api/watched', 'GET', {})
      .then((res: Response) => res.json())
      .then((data: watched[]) => setWatched(data))

  }, []);

  return (
    <div>
      <h1>Display Watched Component</h1>
      {watched === null ? <div>Loading...</div>
        : watched.map((item: watched) => {
          return (
            <div key={item.username + item.imdbID + item.date }>
              {JSON.stringify(item)}
              <DisplayMiniMediaInfo imdbID={item.imdbID}/>
            </div>
          )
        })
      }
    </div>
  )
}
