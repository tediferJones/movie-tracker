'use client';
import { useState, useEffect } from 'react';
// import { v4 as uuidv4 } from 'uuid';
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
      // If you want to migrate LinkToMedia functions this would be the place to do it
    // fetch checker
    // if (!checker) add to DB
    // fetch get, if it exists then user gets MediaInfo, if data returns null user gets the error message below
  }, [])

  function returnList(key: string) {
    if (movieInfo) {
      let singularForm = key;
      let pluralForm;
      if (key === 'Actors') {
        singularForm = 'Actor'
        pluralForm = key;
      } else if (key === 'Country') {
        singularForm = key
        pluralForm = 'Countries';
      } else {
        pluralForm = key + 's';
      }
      return (
        <div className='m-4 bg-gray-700 p-4'>
          <h1 className='text-xl'>{movieInfo[key].length === 1 ? singularForm : pluralForm}</h1>
          {movieInfo[key].map((item: string) => <div key={`${key}-${item}`} className='pb-0 pt-4'>{item}</div>)}
        </div>
      )
    }
  }

  return (
    <>
      {movieInfo === null ? <h1>Loading...</h1>
        : !movieInfo ? <h1>Error: We couldn't find that imdbID in the database</h1>
          : <>
            {/* Primary Information Section */}
            <div className='mx-auto my-4 flex w-4/5 flex-wrap md:flex-nowrap'>
              {movieInfo.Poster ? <img className='m-auto' src={movieInfo.Poster}/> : []}
              <div className='flex w-auto flex-col justify-around'>
                <h1 className='text-center text-3xl'>
                  {movieInfo.Title} 
                  {movieInfo.Year ? <span className='px-4'>({movieInfo.Year})</span> : []}
                </h1>
                <div className='flex justify-between p-4'>
                  <div className='flex-1 text-center'>Rated: {movieInfo.Rated || 'N/A'}</div>
                  <div className='flex-1 text-center'>Runtime: {movieInfo.Runtime ? `${movieInfo.Runtime} mins` : 'N/A'}</div>
                  <div className='flex-1 text-center'>
                    Released: {movieInfo.Released ? new Date(movieInfo.Released).toLocaleDateString() : 'N/A'}
                  </div>
                </div>
                <h1 className='px-4 text-xl'>Plot:</h1>
                <p className='py-4 text-center'>
                  {movieInfo.Plot ? movieInfo.Plot : `No Plot Information is currently available for ${movieInfo.Title}`}
                </p>
                <h1 className='px-4 text-xl'>Ratings:</h1>
                <div className='flex flex-wrap justify-around'>
                  <div className='p-4 text-center'>
                    IMDB: {movieInfo.IMDBRating ? `${movieInfo.IMDBRating / 10} / 10` : 'N/A'}
                  </div>
                  <div className='p-4 text-center'>
                    RottenTomatoes: {movieInfo.RottenTomatoesRating ? `${movieInfo.RottenTomatoesRating}%` : 'N/A'}
                  </div>
                  <div className='p-4 text-center'>Metacritic: {movieInfo.MetacriticRating || 'N/A'}</div>
                </div>
                <div className='flex p-4'>
                  <div className='pr-2 text-xl'>Awards: </div>
                  <div className='m-auto text-center'>
                    {movieInfo.Awards ? movieInfo.Awards : `This ${movieInfo.Type} has no awards`}
                  </div>
                </div>
              </div>
            </div>

            {/* if series show total seasons, if episode show Season/Episode info */}
            <div className='m-auto flex w-4/5 justify-around py-2'>
              <ManageMovieInfo imdbID={movieInfo.imdbID} />
              <div className='bg-gray-700 p-4'>Type: {movieInfo.Type}</div>
              {movieInfo.Type === 'series' ? <div className='bg-gray-700 p-4'>Total Seasons: {movieInfo.totalSeasons}</div> : []}
              {movieInfo.Type === 'episode' ? <div className='bg-gray-700 p-4'>Season: {movieInfo.Season}</div> : []}
              {movieInfo.Type === 'episode' ? <div className='bg-gray-700 p-4'>Episode: {movieInfo.Episode}</div> : []}
              {movieInfo.Type === 'episode' ? <a className='bg-red-600 p-4' 
                href={`/media/${movieInfo.seriesID}`}
              >LINK TO SERIES</a>
                : []}
            </div>

            {/* CENTERED DIV WITH LESS THAN 100% width and NO CONTAINER */}
            {/* show array data types in lists*/}
            <div className='m-auto flex w-4/5 justify-between py-4'>
              <div className='flex w-1/2 flex-col justify-between'>
                {returnList('Actors')}
                {returnList('Director')}
                {returnList('Writer')}
              </div>
              <div className='flex w-1/2 flex-col justify-between'>
                {returnList('Genre')}
                {returnList('Language')}
                {returnList('Country')}
              </div>
            </div>

            {/* Display the less important movie info */}
            <div className='m-auto flex w-11/12 flex-wrap justify-center'>
              <div className='m-4 bg-gray-700 p-4'>imdbID: {movieInfo.imdbID}</div>
              <div className='m-4 bg-gray-700 p-4'>Movie Info Cached at: {new Date(movieInfo.cachedAt).toLocaleString()}</div>
              <div className='m-4 bg-gray-700 p-4'>DVD Release: {movieInfo.DVD ? new Date(movieInfo.DVD).toLocaleDateString() : 'N/A'}</div>
              <div className='m-4 bg-gray-700 p-4'>Box Office Profits: {movieInfo.BoxOffice ? '$' + movieInfo.BoxOffice.toLocaleString() : 'N/A'}</div>
              <div className='m-4 bg-gray-700 p-4'>Production: {movieInfo.Production || 'N/A'}</div>
              <div className='m-4 bg-gray-700 p-4'>Website: {movieInfo.Website || 'N/A'}</div>
              <div className='m-4 bg-gray-700 p-4'>imdbVotes: {movieInfo?.imdbVotes?.toLocaleString() || 'N/A'}</div>
            </div>

            {/* OLD FORMAT IS BELOW */}
            <h1>Put DisplayEpisodes comp up here</h1>
            <h1>Put ManageList and ManageWatched side-by-side, give ManageReview full width, and maybe put other user's reviews below that</h1>
            <h1>Move ManageMediaInfo somewhere else, could just throw it in the less important movie info div above</h1>
            <ManageLists imdbID={movieInfo.imdbID} />
            <ManageReview imdbID={movieInfo.imdbID} />
            <div>{new Date(Number(movieInfo.cachedAt)).toLocaleString()}</div>
            <ManageMovieInfo imdbID={movieInfo.imdbID} />
            <ManageWatched imdbID={movieInfo.imdbID} />
            {movieInfo.Type !== 'series' ? [] :
              <div>
                {[...Array(movieInfo.totalSeasons).keys()].map((season: number) => {
                  return <DisplayEpisodes imdbID={movieInfo.imdbID} season={season + 1} key={season + 1}/>
                })}
              </div>
            }
          </>}
    </>
  )
}
