'use client';

import { useState, useEffect } from 'react';
import { episodeList, episode } from '@/types';
import LinkToMedia from '@/components/LinkToMedia';
import easyFetch from '@/modules/easyFetch';

export default function DisplayEpisodes(props: { imdbID: string, season: number }) {
  const { imdbID, season } = props;
  // console.log(imdbID);

  const [episodeList, setEpisodeList] = useState<episodeList | null>(null);
  const [expandList, setExpandList] = useState<boolean>(false)

  useEffect(() => {
    easyFetch('/api/search', 'GET', { 
      queryTerm: 'i', 
      searchTerm: imdbID, 
      queryType: 'season', 
      searchType: season, 
    }).then((res: Response) => res.json())
      .then((data: episodeList) => setEpisodeList(data));
  }, [])

  function toggleEpisodes() {
    const style = document.getElementById(`season${season}Container`)?.style
    setExpandList(!expandList);
    if (style) {
      style.display = expandList ? 'none' : 'block';
    }
  }

  return (
    <div className='bg-purple-400 w-4/5'>
      <button className='text-2xl flex justify-between w-full p-4' onClick={toggleEpisodes}>
        <h1>SEASON {season}</h1>
        <h1>{document.getElementById(`season${season}Container`)?.style.display === 'none' ? '+' : '-'}</h1>
      </button>
      {/*
      <div>{JSON.stringify(episodeList.Episodes)}</div>
      */}
      <div id={`season${season}Container`} style={{ display: 'none' }}>
        {episodeList === null ? <h1>Loading...</h1> : 
          episodeList.Episodes.map((episode: episode) => {
            return (
              <div className='flex' key={episode.imdbID}>
                <div className='flex-1'>{episode.Title}</div>
                <div className='flex-1'>{episode.Released}</div>
                <div className='flex-1'>Episode: {episode.Episode}</div>
                <div className='flex-1'>IMDB Rating: {episode.imdbRating}</div>
                <div className='flex-1'>{episode.imdbID}</div>
                <LinkToMedia imdbID={episode.imdbID}><h1>Link To Episode</h1></LinkToMedia>
              </div>
            )
        })}
      </div>
    </div>
  )
}
