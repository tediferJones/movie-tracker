'use client';

import { useState, useEffect } from 'react';
import easyFetch from '@/modules/easyFetch';
import { watched } from '@prisma/client';

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
    <div className='flex flex-col bg-gray-700 p-4 h-full max-h-[75vh] justify-between'>
      <h1 className='text-xl mb-2'>Manage Watched Records</h1>
      <div className='overflow-y-auto'>
        {watchHistory === null ? <div className='text-center my-2'>Loading...</div> 
          : watchHistory.length === 0 ? <h1 className='text-center my-2'>No Watched Records Found</h1> 
            : watchHistory.map((item: watched) => {
              return (
                <div className='p-2 my-2 bg-gray-200 flex flex-wrap gap-2 justify-between' key={item.id}>
                  <div className='m-auto text-black text-center flex-[2]'>{new Date(item.date).toLocaleString()}</div>
                  <button className='bg-red-600 p-2 flex-1'
                    onClick={deleteFuncCreator(item.id)}
                  >Delete</button>
                </div>
              )
            })}
      </div>
      <button className='bg-green-500 p-4 mt-2'
        onClick={newWatched}
      >Add Record</button>
    </div>
  )
}
