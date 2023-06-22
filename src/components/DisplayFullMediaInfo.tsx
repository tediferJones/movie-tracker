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
        <div className='m-4 p-4 bg-gray-700'>
          <h1 className='text-xl'>{movieInfo[key].length === 1 ? singularForm : pluralForm}</h1>
          {movieInfo[key].map((item: string) => <div key={`${key}-${item}`} className='pt-4 pb-0'>{item}</div>)}
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
            <div className='w-4/5 mx-auto my-4 flex flex-wrap md:flex-nowrap'>
              {movieInfo.Poster ? <img className='m-auto' src={movieInfo.Poster}/> : []}
              <div className='w-auto flex flex-col justify-around'>
                <h1 className='text-3xl text-center'>
                  {movieInfo.Title} 
                  {movieInfo.Year ? <span className='px-4'>({movieInfo.Year})</span> : []}
                </h1>
                <div className='p-4 flex justify-between'>
                  <div className='flex-1 text-center'>Rated: {movieInfo.Rated || 'N/A'}</div>
                  <div className='flex-1 text-center'>Runtime: {movieInfo.Runtime ? `${movieInfo.Runtime} mins` : 'N/A'}</div>
                  <div className='flex-1 text-center'>
                    Released: {movieInfo.Released ? new Date(movieInfo.Released).toLocaleDateString() : 'N/A'}
                  </div>
                </div>
                <h1 className='text-xl px-4'>Plot:</h1>
                <p className='text-center py-4'>
                  {movieInfo.Plot ? movieInfo.Plot : `No Plot Information is currently available for ${movieInfo.Title}`}
                </p>
                <h1 className='text-xl px-4'>Ratings:</h1>
                <div className='flex flex-wrap justify-around'>
                  <div className='p-4 text-center'>
                    IMDB: {movieInfo.IMDBRating ? `${movieInfo.IMDBRating / 10} / 10` : 'N/A'}
                  </div>
                  <div className='p-4 text-center'>
                    RottenTomatoes: {movieInfo.RottenTomatoesRating ? `${movieInfo.RottenTomatoesRating}%` : 'N/A'}
                  </div>
                  <div className='p-4 text-center'>Metacritic: {movieInfo.MetacriticRating || 'N/A'}</div>
                </div>
                <div className='p-4 flex'>
                  <div className='text-xl pr-2'>Awards: </div>
                  <div className='m-auto text-center'>
                    {movieInfo.Awards ? movieInfo.Awards : `This ${movieInfo.Type} has no awards`}
                  </div>
                </div>
              </div>
            </div>

            {/* if series show total seasons, if episode show Season/Episode info */}
            <div className='w-4/5 flex justify-around m-auto py-2'>
              <div className='p-4 bg-gray-700'>Type: {movieInfo.Type}</div>
              {movieInfo.Type === 'series' ? <div className='p-4 bg-gray-700'>Total Seasons: {movieInfo.totalSeasons}</div> : []}
              {movieInfo.Type === 'episode' ? <div className='p-4 bg-gray-700'>Season: {movieInfo.Season}</div> : []}
              {movieInfo.Type === 'episode' ? <div className='p-4 bg-gray-700'>Episode: {movieInfo.Episode}</div> : []}
              {movieInfo.Type === 'episode' ? <a className='p-4 bg-red-600' 
                href={`/media/${movieInfo.seriesID}`}
              >LINK TO SERIES</a>
                : []}
            </div>

            {/* CENTERED DIV WITH LESS THAN 100% width and NO CONTAINER */}
            {/* show array data types in lists*/}
            <div className='w-4/5 py-4 m-auto flex justify-between'>
              <div className='w-1/2 flex flex-col justify-between'>
                {returnList('Actors')}
                {returnList('Director')}
                {returnList('Writer')}
              </div>
              <div className='w-1/2 flex flex-col justify-between'>
                {returnList('Genre')}
                {returnList('Language')}
                {returnList('Country')}
              </div>
            </div>

            {/* Display the less important movie info */}
            <div className='w-11/12 m-auto flex flex-wrap justify-center'>
              <div className='m-4 p-4 bg-gray-700'>imdbID: {movieInfo.imdbID}</div>
              <div className='m-4 p-4 bg-gray-700'>Movie Info Cached at: {new Date(movieInfo.cachedAt).toLocaleString()}</div>
              <div className='m-4 p-4 bg-gray-700'>DVD Release: {movieInfo.DVD ? new Date(movieInfo.DVD).toLocaleDateString() : 'N/A'}</div>
              <div className='m-4 p-4 bg-gray-700'>Box Office Profits: {movieInfo.BoxOffice ? '$' + movieInfo.BoxOffice.toLocaleString() : 'N/A'}</div>
              <div className='m-4 p-4 bg-gray-700'>Production: {movieInfo.Production || 'N/A'}</div>
              <div className='m-4 p-4 bg-gray-700'>Website: {movieInfo.Website || 'N/A'}</div>
              <div className='m-4 p-4 bg-gray-700'>imdbVotes: {movieInfo?.imdbVotes?.toLocaleString() || 'N/A'}</div>
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
