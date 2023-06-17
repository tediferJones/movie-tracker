'use client';
import { useState, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { cleanMovieInfo } from '@/types';
import ManageLists from '@/components/ManageLists';
import ManageMovieInfo from '@/components/ManageMovieInfo';
import ManageReview from '@/components/ManageReview';
import ManageWatched from '@/components/ManageWatched';
import DisplayEpisodes from '@/components/DisplayEpisodes';
import easyFetch from '@/modules/easyFetch';

export default function (props: { imdbID: string }) {
  const { imdbID } = props;
  const [movieInfo, setMovieInfo] = useState<cleanMovieInfo | null | false>(null);

  useEffect(() => {
    easyFetch('/api/movies', 'GET', { imdbID })
        .then((res: Response) => res.json())
        .then((data: cleanMovieInfo | null) => data ? setMovieInfo(data) : setMovieInfo(false))
  }, [])

  return (
    <div>
      <h1>Display Full Movie Info Component</h1>
      {movieInfo === null ? <h1>Loading...</h1>
      : !movieInfo ? <h1>Error: We couldn't find that imdbID in the database</h1>
      : <div>
        <h1 className='text-3xl'>{movieInfo.Title}</h1>
        <img src={movieInfo.Poster}/>
        {Object.keys(movieInfo).map((key: string) => {
          return (
            <div key={uuidv4()}>
              {`${key}: ${movieInfo[key]}`}
            </div>
          )
        })}
        <ManageLists imdbID={movieInfo.imdbID} />
        <ManageReview imdbID={movieInfo.imdbID} />
        <div>{new Date(Number(movieInfo.cachedAt)).toLocaleString()}</div>
        <ManageMovieInfo imdbID={movieInfo.imdbID} />
        <ManageWatched imdbID={movieInfo.imdbID} />
        {movieInfo.Type !== 'series' ? [] :
          <div>
            {[...Array(movieInfo.totalSeasons).keys()].map((i: number) => i + 1).map((season: number) => {
              return (
                <DisplayEpisodes imdbID={movieInfo.imdbID} season={season} key={season}/>
              )
            })}
          </div>
        }
      </div>}
    </div>
  )
}
