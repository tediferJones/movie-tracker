'use client';

import { useState, useEffect } from 'react';
import { episodeList, episode } from '@/types';
import Link from 'next/link';
import easyFetch from '@/modules/easyFetch';
import DisplayDropDown from './DisplayDropDown';

export default function DisplayEpisodes({ imdbID, season }: { imdbID: string, season: number }) {
  const [episodeList, setEpisodeList] = useState<episodeList | null>(null);

  useEffect(() => {
    easyFetch('/api/search', 'GET', { 
      queryTerm: 'i', 
      searchTerm: imdbID, 
      queryType: 'season', 
      searchType: season.toString(), 
    }).then((data: episodeList) => setEpisodeList(data));
  }, [])

  function episodes(): JSX.Element[] {
    if (!episodeList) return [];

    return episodeList.Episodes.map((episode: episode) => {
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
    })
  }

  return episodeList === null ? <h1>Loading...</h1> :
    <DisplayDropDown header={`Season ${season}`} content={episodes()} />
}
