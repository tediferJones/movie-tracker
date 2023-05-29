'use client';
import { useState, useEffect } from 'react';
import { cleanMovieInfo } from '@/types';
import AddToMyList from '@/components/AddToMyList';
import UpdateCachedMovie from '@/components/UpdateCachedMovie';
import { v4 as uuidv4 } from 'uuid';

export default function (props: any) {
  const { imdbID } = props;
  const [movieInfo, setMovieInfo] = useState<cleanMovieInfo | null>(null);

  useEffect(() => {
    // i guess if you really want it to be RESTful, this where one would write the logic with API calls
    fetch('/api/movies?' + new URLSearchParams({ imdbID }))
        .then((res: any) => res.json())
        .then((data: any) => setMovieInfo(data))
  }, [])

  return (
    <div>
      <h1>Display Full Movie Info Component</h1>
      {movieInfo === null ? [] :
      <div>
        <h1 className='text-3xl'>{movieInfo.Title}</h1>
        <img src={movieInfo.Poster}/>

        {Object.keys(movieInfo).map((key: string) => {
          return (
            <div key={uuidv4()}>
              {`${key}: ${movieInfo[key]}`}
            </div>
          )
        })}
        <AddToMyList imdbID={movieInfo.imdbID} />
        <div>{new Date(Number(movieInfo.cachedAt)).toLocaleString()}</div>
        <UpdateCachedMovie imdbID={movieInfo.imdbID} />
      </div>}
    </div>
  )
}
