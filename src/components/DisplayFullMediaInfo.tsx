'use client';
import { useState, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { cleanMediaInfo } from '@/types';
import ManageLists from '@/components/ManageLists';
import ManageMovieInfo from '@/components/ManageMovieInfo';
import ManageReview from '@/components/ManageReview';
import ManageWatched from '@/components/ManageWatched';
import DisplayEpisodes from '@/components/DisplayEpisodes';
import easyFetch from '@/modules/easyFetch';

export default function DisplayFullMediaInfo(props: { imdbID: string }) {
  const { imdbID } = props;
  const [movieInfo, setMovieInfo] = useState<cleanMediaInfo | null | false>(null);

  useEffect(() => {
    easyFetch('/api/media', 'GET', { imdbID })
      .then((res: Response) => res.json())
      .then((data: cleanMediaInfo | null) => data ? setMovieInfo(data) : setMovieInfo(false))
  }, [])

  return (
    <div>
      <h1>Display Full Movie Info Component</h1>
      {movieInfo === null ? <h1>Loading...</h1>
        : !movieInfo ? <h1>Error: We couldn't find that imdbID in the database</h1>
          : <div>
            <div className='w-full flex justify-center'>
              <div className='w-4/5 flex'>
                {movieInfo.Poster ? <img src={movieInfo.Poster}/> : []}
                <div className='w-full flex flex-col justify-around'>
                  <h1 className='text-3xl text-center'>
                    {movieInfo.Title} 
                    {movieInfo.Year ? <span className='px-4'>({movieInfo.Year})</span> : []}
                  </h1>
                  <div className='p-4 flex justify-between'>
                    <div className='flex-1 text-center'>Rated: {movieInfo.Rated}</div>
                    <div className='flex-1 text-center'>Runtime: {movieInfo.Runtime}</div>
                    <div className='flex-1 text-center'>
                      Released: {movieInfo.Released ? new Date(movieInfo.Released).toLocaleDateString() : []}
                    </div>
                  </div>
                  <h1 className='text-xl px-4'>Plot:</h1>
                  <p className='text-center'>
                    {movieInfo.Plot ? movieInfo.Plot : []}
                  </p>
                  <h1 className='text-xl px-4'>Ratings:</h1>
                  <div className='flex justify-center'>
                    <div className='flex-1 text-center'>
                      IMDB: {movieInfo.IMDBRating ? `${movieInfo.IMDBRating / 10} / 10` : ''}
                    </div>
                    <div className='flex-1 text-center'>
                      RottenTomatoes: {movieInfo.RottenTomatoesRating ? `${movieInfo.RottenTomatoesRating}%` : ''}
                    </div>
                    <div className='flex-1 text-center'>Metacritic: {movieInfo.MetacriticRating}</div>
                  </div>
                  <div>
                    <span className='text-xl px-4'>Awards: </span>
                    {movieInfo.Awards ? movieInfo.Awards : `This ${movieInfo.Type} has no awards`}
                  </div>
                </div>
              </div>
            </div>
            <h1>Put a 2x3 grid here (or just put two flex-columns next to each other), each box should display one of the following: Actors, Writers, Directors, Genre, Country, Language, that should take care of all the array types that could be stored in the DB</h1>
            <h1>And put something here to show the remaining keys not displayed above, a dynamic grid would be nice but harder to find info easily.  And a table with only two columns would look strange</h1>
            {/* OLD FORMAT IS BELOW */}
            <h1 className='text-3xl'>{movieInfo.Title}</h1>
            {movieInfo.Poster ? <img src={movieInfo.Poster}/> : []}
            {Object.keys(movieInfo).map((key: string) => {
              return (
                <div key={uuidv4()}>
                  {`${key}: ${movieInfo[key]}`}
                </div>
              )
            })}
            {movieInfo.Type !== 'episode' ? [] : 
              <a className='p-4 bg-red-600 inline-block' 
                href={`/media/${movieInfo.seriesID}`}
              >LINK TO SERIES</a>
            }
            <ManageLists imdbID={movieInfo.imdbID} />
            <ManageReview imdbID={movieInfo.imdbID} />
            <div>{new Date(Number(movieInfo.cachedAt)).toLocaleString()}</div>
            <ManageMovieInfo imdbID={movieInfo.imdbID} />
            <ManageWatched imdbID={movieInfo.imdbID} />
            {movieInfo.Type !== 'series' ? [] :
              <div>
                {[...Array(movieInfo.totalSeasons).keys()].map((season: number) => {
                  return (
                    <DisplayEpisodes imdbID={movieInfo.imdbID} season={season + 1} key={season + 1}/>
                  )
                })}
              </div>
            }
          </div>}
    </div>
  )
}
