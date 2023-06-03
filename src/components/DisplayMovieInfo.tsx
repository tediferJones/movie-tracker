'use client';
import { useState, useEffect } from 'react';
import { cleanMovieInfo } from '@/types';
import easyFetch from '@/modules/easyFetch';

export default function DisplayMovieInfo(props: any) {
  const { imdbID } = props;
  const [movieInfo, setMovieInfo] = useState<cleanMovieInfo | null>(null);

  useEffect(() => {
    easyFetch('/api/movies', 'GET', { imdbID })
        .then((res: any) => res.json())
        .then((data: any) => setMovieInfo(data))
  }, [])

  return (
    <div>
      <h1>Display Movie Info Component</h1>
      {movieInfo === null ? [] :
      <div>
        <h1 className='text-3xl'>{movieInfo.Title}</h1>
        <a href={`/movies/${movieInfo.imdbID}`}>LINK TO MOVIE</a>
        <img src={movieInfo.Poster}/>
      </div>}
    </div>
  )
}
