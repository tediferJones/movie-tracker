'use client';
import { useState, useEffect } from 'react';
import { cleanMediaInfo } from '@/types';
import easyFetch from '@/modules/easyFetch';

export default function DisplayMiniMediaInfo(props: any) {
  const { imdbID } = props;
  const [movieInfo, setMovieInfo] = useState<cleanMediaInfo | null>(null);

  useEffect(() => {
    easyFetch('/api/media', 'GET', { imdbID })
        .then((res: any) => res.json())
        .then((data: any) => setMovieInfo(data))
  }, [])

  return (
    <div>
      <h1>Display Movie Info Component</h1>
      {movieInfo === null ? [] :
      <div>
        <h1 className='text-3xl'>{movieInfo.Title}</h1>
        {/* THIS SHOULD USE LinkToMovie component, what if the media isnt already stored in the DB? */}
        <a href={`/media/${movieInfo.imdbID}`}>LINK TO MOVIE</a>
        <img src={movieInfo.Poster}/>
      </div>}
    </div>
  )
}
