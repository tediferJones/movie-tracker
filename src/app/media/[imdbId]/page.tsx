'use client';
import ListManager from '@/components/listManager';
import Loading from '@/components/loading';
import ReviewManager from '@/components/reviewManager';
import WatchManger from '@/components/watchManager';
// import DisplayFullMediaInfo from '@/OLD-components/DisplayFullMediaInfo';

import easyFetch from '@/lib/easyFetch';
import { ExistingMediaInfo, strIdxRawMedia } from '@/types';
import Link from 'next/link';
import { Fragment, useEffect, useState } from 'react';

export default function Media({ params }: { params: { imdbId: string } }) {
  const [media, setMedia] = useState<ExistingMediaInfo>();
  const [seriesTitle, setSeriesTitle] = useState<string>();

  useEffect(() => {
    easyFetch<ExistingMediaInfo>('/api/media', 'GET', { imdbId: params.imdbId })
      .then(data => {
        console.log(data)
        setMedia(data)
        if (data.seriesId) {
          easyFetch<strIdxRawMedia>('/api/search', 'GET', { 
            searchTerm: data.seriesId, 
            searchType: 'series', 
            queryTerm: 'i', 
            queryType: 'type',
          }).then(data => {
              console.log('SEARCH RESULTS', data)
              if (data.Response) setSeriesTitle(data.Title)
            })
        }
      })
  }, [])

  function formatTime(mins: number) {
    const hours = Math.floor(mins / 60)
    return `${hours ? `${hours}h` : ''}${mins % 60}m`
  }

  function fromCamelCase(str: string, isPlural?: boolean) {
    if (str === 'seriesId') return 'Series'
    return str.split('').reduce((str, char, i) => {
      if (i === 0) return char.toUpperCase();
      if ('A' <= char && char <= 'Z') return `${str} ${char}`;
      return str + char;
    }, '') + (isPlural ? 's' : '')
  }

  function getLinks(arr: string[], urlParam: string) {
    return arr.map((person: string, i: number, arr: string[]) => {
      return <Fragment key={`${urlParam}-${person}`}>
        <Link href={`/${urlParam}/${person}`}
          className='underline'
        >{person}</Link>
        {i + 1 < arr.length ? ', ' : ''}
      </Fragment>
    })
  }

  function formatSeason(n: number) {
    const str = n.toString();
    return n > 10 ? str : '0' + str 
  }

  return !media ? <div className='absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2'><Loading /></div> : 
    <div>
      <div className='w-4/5 mx-auto my-4 relative flex gap-4 max-h-[60vh]'>
        <WatchManger imdbId={media.imdbId} />
        <ListManager imdbId={media.imdbId} />
      </div>

      <ReviewManager imdbId={media.imdbId}/>

      <div className='mx-auto my-4 flex w-4/5 flex-wrap md:flex-nowrap gap-4'>
        {media.poster ? <img className='m-auto' src={media.poster}/> : []}
        <div className='flex w-auto flex-col justify-around border-2 p-4 text-lg'>
          <h1 className='text-center text-3xl pb-4'>
            <Link href={`https://www.imdb.com/title/${media.imdbId}`}
              className='underline'
            >
              {media.title} 
            </Link>
            <span className='px-4'>
              ({media.startYear + (media.endYear ? ` - ${media.endYear}` : '')})
            </span>
          </h1>
          <hr />
          <div className='p-4 flex flex-wrap gap-4'>
            <div className='flex-1 text-center m-auto'>Rated: {media.rated || 'N/A'}</div>
            <div className='flex-1 text-center m-auto'>
              Runtime: {media.runtime ? formatTime(media.runtime) : 'N/A'}
            </div>
            {!media.totalSeasons ? [] :
              <div className='flex-1 text-center m-auto'>
                Seasons: {media.totalSeasons}
              </div>
            }
            {!(media.season && media.episode) ? [] : 
              <div className='text-center'>
                {`S${formatSeason(media.season)}E${formatSeason(media.episode)}`}
              </div>
            }
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

      <div className='p-4 border-2 w-4/5 mx-auto'>
        <div className='flex flex-wrap justify-center gap-4 text-lg pb-4'>
          {['director', 'writer', 'actor'].map(position => {
            if (!media[position]) return [];
            return  <span key={position}>
              {fromCamelCase(position, media[position].length !== 1)}: {getLinks(media[position], 'people')}
            </span>
          })}
        </div>
        <hr />
        <div className='py-4 px-8 grid grid-cols-3 gap-4'>
          <h3 className='text-xl col-span-3 flex justify-between'>Details: 
            <button className='colorPrimary text-sm'>Update</button>
          </h3>
          {[
            'type', 'seriesId', 'released', 'dvd',
            'genre', 'country', 'language', 'boxOffice',
            'production', 'website', 'imdbVotes',
          ].map(key => {
            const fixer: { [key: string]: Function } = {
              released: (n: number) => new Date(n).toLocaleDateString(undefined, {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              }),
              dvd: (n: number) => new Date(n).toLocaleDateString(undefined, {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              }),
              genre: (arr: string[]) => getLinks(arr, 'genres'),
              country: (arr: string[]) => getLinks(arr, 'countries'),
              language: (arr: string[]) => getLinks(arr, 'languages'),
              boxOffice: (n: number) => `$ ${n.toLocaleString()}`,
              imdbVotes: (n: number) => n.toLocaleString(),
              seriesId: (imdbId: string) => <Link
                href={`/media/${imdbId}`}
                className='underline'
              >{seriesTitle}</Link>,
            }
            if (!media[key]) return [];
            return <Fragment key={key}>
              <div className='text-center'>
                {fromCamelCase(key)}
              </div>
              <div className='text-center col-span-2'>
                {fixer[key] ? fixer[key](media[key]) : fromCamelCase(media[key].toString())}
              </div>
            </Fragment>
          })}
        </div>
      </div>


      {/*
      <div className='break-words'>{Object.keys(media || {}).map(key => {
        // @ts-ignore
        return <p key={key}>{key}: {media[key]}</p>
      })}</div>
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
