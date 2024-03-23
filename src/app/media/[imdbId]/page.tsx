'use client';
import Loading from '@/components/loading';
// import DisplayFullMediaInfo from '@/OLD-components/DisplayFullMediaInfo';

import easyFetch from '@/lib/easyFetch';
import { ExistingMediaInfo } from '@/types';
import { useEffect, useState } from 'react';

export default function Media({ params }: { params: { imdbId: string } }) {
  const [media, setMedia] = useState<ExistingMediaInfo>();

  useEffect(() => {
    easyFetch<ExistingMediaInfo>('/api/media', 'GET', { imdbId: params.imdbId })
      .then(data => {
        console.log(data)
        setMedia(data)
      })
  }, [])

  function formatTime(mins: number) {
    const hours = Math.floor(mins / 60)
    return `${hours ? `${hours}h` : ''}${mins % 60}m`
  }

  return !media ? <Loading /> : 
    <div>
      <div className='mx-auto my-4 flex w-4/5 flex-wrap md:flex-nowrap gap-4'>
        {media.poster ? <img className='m-auto' src={media.poster}/> : []}
        <div className='flex w-auto flex-col justify-around border-2 p-4'>
          <h1 className='text-center text-3xl pb-4'>
            {media.title} 
            <span className='px-4'>
              ({media.startYear + (media.endYear ? ` - ${media.endYear}` : '')})
            </span>
          </h1>
          <hr />
          <div className='flex justify-between p-4'>
            <div className='flex-1 text-center m-auto'>Rated: {media.rated || 'N/A'}</div>
            <div className='flex-1 text-center m-auto'>
              Runtime: {media.runtime ? formatTime(media.runtime) : 'N/A'}
            </div>
            {/*
            <div className='flex-1 text-center m-auto'>
              Released: {media.released ? new Date(media.released).toLocaleDateString(undefined, {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              }) : 'N/A'}
            </div>
            */}
          </div>
          <hr />
          <p className='py-4 text-center'>
            {media.plot ? media.plot : `No Plot Information is currently available for ${media.title}`}
          </p>
          <hr />
          <div className='flex flex-wrap justify-around'>
            <div className='p-4 text-center'>
              IMDB: {media.imdbRating ? `${(media.imdbRating / 10).toFixed(1)} / 10` : 'N/A'}
            </div>
            <div className='p-4 text-center'>
              RottenTomatoes: {media.tomatoRating ? `${media.tomatoRating}%` : 'N/A'}
            </div>
            <div className='p-4 text-center'>
              Metacritic: {media.metaRating ? `${media.metaRating}/100` : 'N/A'}
            </div>
          </div>
          <hr />
          <div className='flex pt-4'>
            <div className='m-auto text-center'>
              {media.awards ? media.awards : `This ${media.type} has no awards`}
            </div>
          </div>
        </div>
      </div>

      <div className='break-words'>{Object.keys(media || {}).map(key => {
        // @ts-ignore
        return <p key={key}>{key}: {media[key]}</p>
      })}</div>
      {/*
      <p>{JSON.stringify(media, null, 2)}</p>
      {Object.keys(media || {}).map(key => {
        // return <p key={key}>{key}: {media[key].toString()}</p>
        return <div key={key}>
          <div>{key}</div>
          { // @ts-ignore
            Object.keys(media[key]).map(itemKey => {
              // @ts-ignore
              return <p key={itemKey}>{itemKey}: {media[key][itemKey]}</p>
          })}
        </div>
      })}
      */}
    </div>

  // return <DisplayFullMediaInfo imdbID={imdbID} />
}
