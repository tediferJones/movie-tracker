'use client';

import { useState, useEffect } from 'react';
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

  // Add LinkToMovie button with each episode's imdbID

  return (
    <div className='bg-purple-400'>
      <h1 className='text-2xl'>SEASON {season}</h1>
      <div>{JSON.stringify(episodeList.Episodes)}</div>
    </div>
  )
}
