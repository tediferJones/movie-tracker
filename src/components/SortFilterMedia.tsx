'use client';

import { useState } from 'react';
import { media } from "@prisma/client";

// Move this to types file
interface test extends media {
  [key: string]: any
}

export default function SortFilterMedia({ media }: { media: media[] }) {
  console.log(media);
  const [refreshTrigger, setRefreshTrigger] = useState<boolean>(false)

  function handleSort(key: string, type: string) {
    if (type === 'string') {
      media.sort((a: test, b: test) => a[key] < b[key] ? 1 : -1)
    } else if (type === 'number') {
      media.sort((a: test, b: test) => a[key] - b[key])
    }

    console.log(media)
    setRefreshTrigger(!refreshTrigger)
  }

  return (
    <div>
      <h1>SORT AND FILTER COMPONENT</h1>
      <div className='flex'>
        <button className='flex-1 bg-gray-700' onClick={() => handleSort('Title', 'string')}>Title</button>
        <button className='flex-1 bg-gray-700' onClick={() => handleSort('Year', 'number')}>Year</button>
        <button className='flex-1'></button>
      </div>
      {media.map((item: media) => {
        return (
          <div className='flex justify-between p-4 m-4 bg-gray-700'
            key={item.imdbID}
          >
            <h1 className='flex-1'>{item.Title}</h1>
            <h3 className='flex-1'>{item.Year}</h3>
            <a className='flex-1'
              href={`/media/${item.imdbID}`}
            >LINK TO MOVIE</a>
          </div>
        )
      })}

    </div>
  )
}
