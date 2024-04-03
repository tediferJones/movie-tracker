import Link from 'next/link';
import { Fragment, useEffect, useState } from 'react';
import { ExistingMediaInfo, strIdxRawMedia } from '@/types';
import Loading from '@/components/loading';
import easyFetch from '@/lib/easyFetch';
import SeasonDisplay from './seasonDisplay';
import { Button } from './ui/button';

export default function MediaInfo({ imdbId }: { imdbId: string }) {
  const [media, setMedia] = useState<ExistingMediaInfo>();
  const [seriesTitle, setSeriesTitle] = useState<string>();
  const [refreshTrigger, setRefreshTrigger] = useState(false);

  useEffect(() => {
    easyFetch<ExistingMediaInfo>('/api/media', 'GET', { imdbId })
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
  }, [refreshTrigger]);

  function formatTime(mins: number) {
    const hours = Math.floor(mins / 60)
    return `${hours ? `${hours}h` : ''}${mins % 60}m`
  }

  function formatSeason(n: number) {
    const str = n.toString();
    return n > 10 ? str : '0' + str 
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
    updatedAt: (n: number) => new Date(n).toLocaleTimeString(undefined, {
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

  return !media ? <Loading /> : <>
    <div className='flex flex-wrap gap-4 md:flex-nowrap'>
      {media.poster ? <img className='m-auto showOutline' src={media.poster}/> : []}
      <div className='showOutline flex-1 flex w-auto flex-col justify-around p-4 text-lg'>
        <h1 className='pb-4 text-center text-3xl'>
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
        <div className='flex flex-wrap gap-4 p-4'>
          <div className='m-auto flex-1 text-center'>Rated: {media.rated || 'N/A'}</div>
          <div className='m-auto flex-1 text-center'>
            Runtime: {media.runtime ? formatTime(media.runtime) : 'N/A'}
          </div>
          {!media.totalSeasons ? [] :
            <div className='m-auto flex-1 text-center'>
              Seasons: {media.totalSeasons}
            </div>
          }
          {!(media.season && media.episode) ? [] : 
            <div className='flex-1 text-center'>
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

    <div className='showOutline p-4'>
      <div className='flex flex-wrap justify-center gap-4 pb-4 text-lg'>
        {['director', 'writer', 'actor'].map(position => {
          if (!media[position]) return [];
          return  <span key={position}>
            {fromCamelCase(position, media[position].length !== 1)}: {getLinks(media[position], 'people')}
          </span>
        })}
      </div>
      <hr />
      <div className='grid grid-cols-3 gap-4 px-8 py-4'>
        <h3 className='col-span-3 flex justify-between text-xl'>Details: 
          <Button variant='outline' onClick={() => {
            easyFetch('/api/media', 'PUT', { imdbId }, true)
              .then(() => setRefreshTrigger(!refreshTrigger))
          }}>Update</Button>
        </h3>
        {[
          'type', 'seriesId', 'released', 'dvd',
          'genre', 'country', 'language', 'boxOffice',
          'production', 'website', 'imdbVotes', 'updatedAt',
        ].map(key => {
            if (!media[key] || media[key]?.length === 0) return [];
            return <Fragment key={key}>
              <div className='text-center'>
                {fromCamelCase(key)}
              </div>
              <div className='col-span-2 text-center'>
                {fixer[key] ? fixer[key](media[key]) : fromCamelCase(media[key].toString())}
              </div>
            </Fragment>
          })}
      </div>
    </div>
    
    {!(media.season || media.totalSeasons) ? [] : 
      <SeasonDisplay
        imdbId={media.seriesId || media.imdbId}
        seasons={(media.season || media.totalSeasons) as number}
        isEpisode={!(Number(media.totalSeasons) > 1)}
      />
    }
  </>
}
