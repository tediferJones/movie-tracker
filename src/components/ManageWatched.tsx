'use client';

import { useState, useEffect } from 'react';
import { watched } from '@/types';
import easyFetch from '@/modules/easyFetch';

export default function ManageWatched(props: { imdbID: string }) {
  const { imdbID } = props;
  const [watchHistory, setWatchHistory] = useState<null | watched[]>(null);
  const [refreshTrigger, setRefreshTigger] = useState<boolean>(false);
 
  useEffect(() => {
    easyFetch('/api/watched', 'GET', { imdbID })
        .then((res: Response) => res.json())
        .then((data: watched[]) => setWatchHistory(data))
  }, [refreshTrigger])

  async function newWatched() {
    await easyFetch('/api/watched', 'POST', { imdbID, watchedDate: Date.now() });
    setRefreshTigger(!refreshTrigger);
  }

  // returns a function for the given ID, we hope this is safer than putting the ID in the raw HTML
  function deleteFuncCreator(id: string) {
    return async function() {
      await easyFetch('/api/watched', 'DELETE', { id });
      setRefreshTigger(!refreshTrigger);
    }
  }

  return (
    <div>
      <h1>THIS IS THE MANAGE WATCHED COMPONENT</h1>
      {JSON.stringify(watchHistory)}
      {watchHistory === null ? [] : watchHistory.map((item: watched) => {
        return (
          <div className='flex' key={item.id}>
            <div>{new Date(item.date).toLocaleString()}</div>
            <button className='p-4 bg-red-600'
              onClick={deleteFuncCreator(item.id)}
            >DELETE</button>
          </div>
        )
      })}
      <button className='p-4 bg-green-500'
        onClick={newWatched}
      >ADD NEW WATCHED RECORD</button>
    </div>
  )
}
