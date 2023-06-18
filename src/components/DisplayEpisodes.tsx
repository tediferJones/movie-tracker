'use client';

import { useState, useEffect } from 'react';
import LinkToMedia from '@/components/LinkToMedia';
import easyFetch from '@/modules/easyFetch';

export default function DisplayEpisodes(props: { imdbID: string, season: number }) {
  const { imdbID, season } = props;
  // console.log(imdbID);

  const [episodeList, setEpisodeList] = useState({ Episodes: [] });

  useEffect(() => {
    easyFetch('/api/search', 'GET', { 
      queryTerm: 'i', 
      searchTerm: imdbID, 
      queryType: 'season', 
      searchType: season, 
    }).then((res: Response) => res.json())
      .then((data: any) => setEpisodeList(data));
  }, [])

  return (
    <div className='bg-purple-400'>
      <h1 className='text-2xl'>SEASON {season}</h1>
      {/*
      <div>{JSON.stringify(episodeList.Episodes)}</div>
      */}
      {episodeList.Episodes.map((episode: any) => {
        return (
          <div className='flex' key={episode.imdbID}>
            <div className='flex-1'>{episode.Title}</div>
            <div className='flex-1'>{episode.Released}</div>
            <div className='flex-1'>Episode: {episode.Episode}</div>
            <div className='flex-1'>IMDB Rating: {episode.imdbRating}</div>
            <div className='flex-1'>{episode.imdbID}</div>
            <LinkToMedia imdbID={episode.imdbID}/>
          </div>
        )
      })}
    </div>
  )
}
