'use client';

import { useState, useEffect, useRef } from 'react';
import { episodeList, episode } from '@/types';
import Link from 'next/link';
import easyFetch from '@/modules/easyFetch';

export default function DisplayEpisodes({ imdbID, season }: { imdbID: string, season: number }) {
  // console.log(imdbID, season);

  const [episodeList, setEpisodeList] = useState<episodeList | null>(null);
  const [expandList, setExpandList] = useState<boolean>(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    easyFetch('/api/search', 'GET', { 
      queryTerm: 'i', 
      searchTerm: imdbID, 
      queryType: 'season', 
      searchType: season, 
    }).then((res: Response) => res.json())
      .then((data: episodeList) => setEpisodeList(data));
  }, [])

  return (
    <div className='bg-gray-700 m-auto w-full'>
      <button className='text-2xl flex justify-between w-full p-4' 
        onClick={() => {
          ref.current?.classList.toggle('hidden');
          setExpandList(!expandList);
        }}
      > <h1>Season {season}</h1>
        <h1>{expandList ? '-' : '+'}</h1>
      </button>

      <div ref={ref} className='hidden'>
        {episodeList === null ? <h1>Loading...</h1> : 
          episodeList.Episodes.map((episode: episode) => {
            return (
              <div className='flex' key={episode.imdbID}>
                <div className='flex-1'>{episode.Title}</div>
                <div className='flex-1'>{episode.Released}</div>
                <div className='flex-1'>Episode: {episode.Episode}</div>
                <div className='flex-1'>IMDB Rating: {episode.imdbRating}</div>
                <div className='flex-1'>{episode.imdbID}</div>
                <Link href={`/media/${episode.imdbID}`}>Link To Episode</Link>
              </div>
            )
        })}
      </div>
    </div>
  )
}
