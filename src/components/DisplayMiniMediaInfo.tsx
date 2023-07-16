'use client';

import { useState, useEffect } from 'react';
import { strIdxMedia } from '@/types';
import easyFetch from '@/modules/easyFetch';

export default function DisplayMiniMediaInfo({ 
  imdbID, 
  display,
}: { 
  imdbID: string, 
  display: string[],
}) {
  const [movieInfo, setMovieInfo] = useState<strIdxMedia | null>(null);

  useEffect(() => {
    easyFetch('/api/media', 'GET', { imdbID })
        .then((res: any) => res.json())
        .then((data: any) => setMovieInfo(data))
  }, [])


  // How do we keep this compact and not stupidly redundant?
  // Just put everything in the HTML with a bunch of ternary statements
  // Only display the ones that exist in the display prop
  
  // OLD VERSION
  // <h1 className='text-3xl'>{movieInfo.Title}</h1>
  // <a href={`/media/${movieInfo.imdbID}`}>LINK TO MOVIE</a>
  // {movieInfo.Poster ? <img src={movieInfo.Poster}/> : []}
  //

  function exists(key: string, element: any) {
    if (display.includes(key) && movieInfo && movieInfo[key]) {
      return element
    }
    return []
  }
  // {display.includes('Title') && movieInfo?.Title ? <h1>{movieInfo.Title}</h1> : []}
  // {display.includes('Poster') && movieInfo?.Poster ? <img src={movieInfo.Poster} /> : []}
  // {display.includes('Runtime') && movieInfo?.Runtime ? <div>{movieInfo.Runtime} mins</div> : []}

  return (
    <div>
      {movieInfo === null ? <h1>Loading...</h1> :
        <a href={`/media/${imdbID}`}>

          <div className='m-4 p-4 bg-gray-700'>
            {exists('Title', <h1>{movieInfo.Title}</h1>)}
            {exists('Poster', <img src={movieInfo?.Poster ? movieInfo.Poster : undefined} />)}
            {exists('Runtime', <div>{movieInfo.Runtime} mins</div>)}
          </div>
        </a>
      }
    </div>
  )
}
