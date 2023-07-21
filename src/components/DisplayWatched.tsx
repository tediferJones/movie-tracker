'use client';

import { useState, useEffect } from 'react';
import { watched } from '@prisma/client';
import DisplayMiniMediaInfo from '@/components/DisplayMiniMediaInfo';
import ExpandableList from '@/components/ExpandableList';
import easyFetch from '@/modules/easyFetch';

export default function DisplayWatched() {
  const [watched, setWatched] = useState<watched[] | null>(null)

  useEffect(() => {
    easyFetch('/api/watched', 'GET')
      .then((data: watched[]) => setWatched(data))
  }, []);

  function listItems(): JSX.Element[] {
    if (watched === null) return [];

    return watched.map((item: watched) => {
      return <DisplayMiniMediaInfo className='m-2 flex justify-between bg-gray-700 p-4'
        key={item.username + item.imdbID + item.date} 
        imdbID={item.imdbID} 
        display={['Title']} 
        date={item.date}
      />
    })
  }

  return (
    <div>
      <div className='flex justify-between'>
        <h1>Recently Watched Media:</h1>
        {watched === null ? [] : <h1>You have {watched.length} watch records</h1>}
      </div>
      {watched === null ? <div>Loading...</div> :
        <ExpandableList arr={listItems()} />
      }
    </div>
  )
}
