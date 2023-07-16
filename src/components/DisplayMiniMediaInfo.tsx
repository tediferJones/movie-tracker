'use client';

import { useState, useEffect } from 'react';
import { strIdxMedia } from '@/types';
import easyFetch from '@/modules/easyFetch';

export default function DisplayMiniMediaInfo({ 
  imdbID, 
  display,
  date,
}: { 
  imdbID: string, 
  display: string[],
  date?: number,
}) {
  const [movieInfo, setMovieInfo] = useState<strIdxMedia | null>(null);

  useEffect(() => {
    easyFetch('/api/media', 'GET', { imdbID })
        .then((res: any) => res.json())
        .then((data: any) => setMovieInfo(data))
  }, [])

  function exists(key: string) {
    return display.includes(key) && movieInfo && movieInfo[key] !== null;
  }

      // <div className='m-4 p-4 bg-gray-700 flex'>
      // </div>
  return (movieInfo === null ? <h1>Loading...</h1> :
    <a href={`/media/${imdbID}`}>
        {exists('Title') ? <h1>{movieInfo.Title}</h1> : []}
        {exists('Poster') ? <img src={movieInfo.Poster as string} /> : []}
        {exists('Runtime') ? <div>Runtime: {movieInfo.Runtime} mins</div> : []}
        {date ? <div>Watched {new Date(date).toLocaleString('en-us', { dateStyle: 'full', timeStyle: 'short'})}</div> : []}
    </a>
  )
}
