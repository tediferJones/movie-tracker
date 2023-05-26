'use client';
import { useState, useEffect } from 'react';
import { cleanMovieInfo } from '@/types';

export default function DisplayMovieInfo(props: any) {
  const { imdbID } = props;
  const [movieInfo, setMovieInfo] = useState<cleanMovieInfo | null>(null);
  // console.log('just to make sure we arent doing an infinite loop')

  useEffect(() => {
    fetch('/api/movie?' + new URLSearchParams({ imdbID }))
        .then((res: any) => res.json())
        .then((data: any) => setMovieInfo(data))
    // console.log('just to make sure we arent doing an infinite loop')
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
