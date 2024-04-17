import { Button } from '@/components/ui/button';

import Link from 'next/link';
import { Fragment, useEffect, useState } from 'react';
import GetBreadcrumbs from '@/components/subcomponents/getBreadcrumbs';
import GetLinks from '@/components/subcomponents/getLinks';
import Loading from '@/components/subcomponents/loading';
import SeasonDisplay from '@/components/pages/mediaPage/seasonDisplay';
import { formatRuntime, fromCamelCase } from '@/lib/formatters';
import easyFetch from '@/lib/easyFetch';
import { ExistingMediaInfo, StrIdxRawMedia } from '@/types';

export default function MediaInfo({ imdbId }: { imdbId: string }) {
  const [media, setMedia] = useState<ExistingMediaInfo>();
  const [seriesTitle, setSeriesTitle] = useState<string>();
  const [refreshTrigger, setRefreshTrigger] = useState(false);

  useEffect(() => {
    easyFetch<ExistingMediaInfo>('/api/media', 'GET', { imdbId })
      .then(data => {
        setMedia(data)
        if (data.seriesId) {
          easyFetch<StrIdxRawMedia>('/api/search', 'GET', { 
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

  function formatSeason(n: number) {
    const str = n.toString();
    return n > 10 ? str : '0' + str 
  }

  const formatKey: { [key: string]: Function } = {
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
    genre: (arr: string[]) => <GetLinks type='genre' arr={arr} />,
    country: (arr: string[]) => <GetLinks  type='country' arr={arr} />,
    language: (arr: string[]) => <GetLinks  type='language' arr={arr} />,
    boxOffice: (n: number) => `$ ${n.toLocaleString()}`,
    imdbVotes: (n: number) => n.toLocaleString(),
    seriesId: (imdbId: string) => <Link
      href={`/media/${imdbId}`}
      className='underline'
    >{seriesTitle}</Link>,
  }

  return !media ? <Loading /> : <>
    <GetBreadcrumbs links={{home: '/', media: '/media', [media.title]: `/media/${media.imdbId}`}}/>
    <div className='flex flex-wrap gap-4'>
      {media.poster ? <img className='m-auto showOutline' alt={`Poster for ${media.title}`} src={media.poster}/> : []}
      <div className='showOutline flex-1 flex w-auto flex-col justify-around p-4 text-lg'>
        <h1 className='pb-4 text-center text-3xl flex flex-wrap justify-center gap-4'>
          <Link href={`https://www.imdb.com/title/${media.imdbId}`}
            className='underline'
          >
            {media.title} 
          </Link>
          <span>
            ({media.startYear + (media.endYear ? ` - ${media.endYear}` : '')})
          </span>
        </h1>
        <hr />
        <div className='flex flex-wrap gap-4 p-4'>
          <div className='m-auto flex-1 text-center'>Rated: {media.rated || 'N/A'}</div>
          <div className='m-auto flex-1 text-center'>
            Runtime: {media.runtime ? formatRuntime(media.runtime) : 'N/A'}
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
          return  <span key={position} className='flex flex-wrap justify-center gap-1'>
            <span>{fromCamelCase(position, media[position].length !== 1)}:</span>
            <GetLinks type='people' arr={media[position]}/>
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
              <div className='text-center m-auto'>
                {fromCamelCase(key)}
              </div>
              <div className='col-span-2 text-center m-auto'>
                {formatKey[key] ? formatKey[key](media[key]) : fromCamelCase(media[key].toString())}
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
