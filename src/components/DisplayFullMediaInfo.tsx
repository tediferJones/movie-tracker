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
  const [mediaInfo, setMovieInfo] = useState<cleanMediaInfo | null | false>(null);

  useEffect(() => {
    (async () => {
      // must await POST request, because if we GET before POST is completed, there will be nothing to GET
      const checkForImdbID = await easyFetch('/api/media', 'HEAD', { imdbID });
      if (checkForImdbID.status === 404) {
        await easyFetch('/api/media', 'POST', { imdbID });
      }
      const res: Response = await easyFetch('/api/media', 'GET', { imdbID });
      const data = await res.json();
      data ? setMovieInfo(data) : setMovieInfo(false);
    })();
  }, [])

  function returnList(key: string) {
    if (mediaInfo) {
      let singularForm = key;
      let pluralForm;
      if (key === 'Actors') {
        singularForm = 'Actor';
        pluralForm = key;
      } else if (key === 'Country') {
        singularForm = key;
        pluralForm = 'Countries';
      } else {
        pluralForm = key + 's';
      }
      return (
        <div className='m-4 bg-gray-700 p-4'>
          <h1 className='text-xl'>{mediaInfo[key].length === 1 ? singularForm : pluralForm}</h1>
          {mediaInfo[key].map((item: string) => <div key={`${key}-${item}`} className='pb-0 pt-4'>{item}</div>)}
        </div>
      )
    }
  }

  return (
    <>
      {mediaInfo === null ? <h1>Loading...</h1>
        : !mediaInfo ? <h1>Error: We couldn't find that imdbID in the database</h1>
          : <>
            {/* Primary Information Section */}
            <div className='mx-auto my-4 flex w-4/5 flex-wrap md:flex-nowrap'>
              {mediaInfo.Poster ? <img className='m-auto' src={mediaInfo.Poster}/> : []}
              <div className='flex w-auto flex-col justify-around'>
                <h1 className='text-center text-3xl'>
                  {mediaInfo.Title} 
                  {mediaInfo.Year ? <span className='px-4'>({mediaInfo.Year})</span> : []}
                </h1>
                <div className='flex justify-between p-4'>
                  <div className='flex-1 text-center m-auto'>Rated: {mediaInfo.Rated || 'N/A'}</div>
                  <div className='flex-1 text-center m-auto'>Runtime: {mediaInfo.Runtime ? `${mediaInfo.Runtime} mins` : 'N/A'}</div>
                  <div className='flex-1 text-center m-auto'>
                    Released: {mediaInfo.Released ? new Date(mediaInfo.Released).toLocaleDateString() : 'N/A'}
                  </div>
                </div>
                <h1 className='px-4 text-xl'>Plot:</h1>
                <p className='py-4 text-center'>
                  {mediaInfo.Plot ? mediaInfo.Plot : `No Plot Information is currently available for ${mediaInfo.Title}`}
                </p>
                <h1 className='px-4 text-xl'>Ratings:</h1>
                <div className='flex flex-wrap justify-around'>
                  <div className='p-4 text-center'>
                    IMDB: {mediaInfo.IMDBRating ? `${mediaInfo.IMDBRating / 10} / 10` : 'N/A'}
                  </div>
                  <div className='p-4 text-center'>
                    RottenTomatoes: {mediaInfo.RottenTomatoesRating ? `${mediaInfo.RottenTomatoesRating}%` : 'N/A'}
                  </div>
                  <div className='p-4 text-center'>Metacritic: {mediaInfo.MetacriticRating || 'N/A'}</div>
                </div>
                <div className='flex p-4'>
                  <div className='pr-2 text-xl'>Awards: </div>
                  <div className='m-auto text-center'>
                    {mediaInfo.Awards ? mediaInfo.Awards : `This ${mediaInfo.Type} has no awards`}
                  </div>
                </div>
              </div>
            </div>

            {/* if series show total seasons, if episode show Season/Episode info */}
            <div className='m-auto flex w-4/5 justify-around py-2'>
              <ManageMovieInfo imdbID={mediaInfo.imdbID} />
              <div className='bg-gray-700 p-4'>Type: {mediaInfo.Type[0].toUpperCase() + mediaInfo.Type.slice(1)}</div>
              {mediaInfo.Type === 'series' ? <div className='bg-gray-700 p-4'>Total Seasons: {mediaInfo.totalSeasons}</div> : []}
              {mediaInfo.Type === 'episode' ? <div className='bg-gray-700 p-4'>Season: {mediaInfo.Season}</div> : []}
              {mediaInfo.Type === 'episode' ? <div className='bg-gray-700 p-4'>Episode: {mediaInfo.Episode}</div> : []}
              {mediaInfo.Type === 'episode' ? <a className='bg-red-600 p-4' 
                href={`/media/${mediaInfo.seriesID}`}
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
              <div className='m-4 bg-gray-700 p-4'>imdbID: {mediaInfo.imdbID}</div>
              <div className='m-4 bg-gray-700 p-4'>{mediaInfo.Type[0].toUpperCase() + mediaInfo.Type.slice(1)} Cached at: {new Date(mediaInfo.cachedAt).toLocaleString()}</div>
              <div className='m-4 bg-gray-700 p-4'>DVD Release: {mediaInfo.DVD ? new Date(mediaInfo.DVD).toLocaleDateString() : 'N/A'}</div>
              <div className='m-4 bg-gray-700 p-4'>Box Office Profits: {mediaInfo.BoxOffice ? '$' + mediaInfo.BoxOffice.toLocaleString() : 'N/A'}</div>
              <div className='m-4 bg-gray-700 p-4'>Production: {mediaInfo.Production || 'N/A'}</div>
              <div className='m-4 bg-gray-700 p-4'>Website: {mediaInfo.Website || 'N/A'}</div>
              <div className='m-4 bg-gray-700 p-4'>imdbVotes: {mediaInfo?.imdbVotes?.toLocaleString() || 'N/A'}</div>
            </div>

            {/* Manage User Info */}
            <div className='w-4/5 flex mx-auto'>
              <div className='w-1/2 m-4'>
                <ManageLists imdbID={mediaInfo.imdbID} />
              </div>
              <div className='w-1/2 m-4'>
                <ManageWatched imdbID={mediaInfo.imdbID} />
              </div>
            </div>

            {/* OLD FORMAT IS BELOW */}
            <h1>Put DisplayEpisodes comp up here</h1>
            <h1>Put ManageList and ManageWatched side-by-side, give ManageReview full width, and maybe put other user's reviews below that</h1>
            <h1>Move ManageMediaInfo somewhere else, could just throw it in the less important movie info div above</h1>
            <ManageLists imdbID={mediaInfo.imdbID} />
            <ManageReview imdbID={mediaInfo.imdbID} />
            <div>{new Date(Number(mediaInfo.cachedAt)).toLocaleString()}</div>
            <ManageMovieInfo imdbID={mediaInfo.imdbID} />
            <ManageWatched imdbID={mediaInfo.imdbID} />
            {mediaInfo.Type !== 'series' ? [] :
              <div>
                {[...Array(mediaInfo.totalSeasons).keys()].map((season: number) => {
                  return <DisplayEpisodes imdbID={mediaInfo.imdbID} season={season + 1} key={season + 1}/>
                })}
              </div>
            }
          </>}
    </>
  )
}
