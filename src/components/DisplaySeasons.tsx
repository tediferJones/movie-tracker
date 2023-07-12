'use client';

import { useState, useRef } from 'react';
import DisplayEpisodes from "@/components/DisplayEpisodes";

export default function DisplaySeasons(
  { 
    Type, 
    totalSeasons, 
    imdbID,
    Season,
    seriesID,
  }: { 
    Type: string, 
    totalSeasons: number | null, 
    imdbID: string,
    Season: number | null,
    seriesID: string | null,
  }
) {

  const [displaySeasons, setDisplaySeasons] = useState<boolean>(false);
  const ref = useRef<HTMLDivElement>(null);

  return (
    <div className='my-4 mx-auto w-4/5'>
      {Type === 'series' && totalSeasons && totalSeasons > 1 ?
        <>
          <button className='text-2xl p-4 bg-gray-700 w-full flex justify-between'
            onClick={() => {
              ref.current?.classList.toggle('hidden');
              setDisplaySeasons(!displaySeasons);
            }}
          > <h1>{`Seasons 1 - ${totalSeasons}`}</h1>
            <h1>{displaySeasons ? '-' : '+'}</h1>
          </button>
          <div ref={ref} className='w-full hidden' >
            {[...Array(totalSeasons).keys()].map((season: number) => {
              return <DisplayEpisodes imdbID={imdbID} season={season + 1} key={season + 1}/>
            })}
          </div>
        </>
        : Type === 'series' && totalSeasons && totalSeasons === 1 ? 
          <DisplayEpisodes imdbID={imdbID} season={totalSeasons} key={totalSeasons}/>
        : Type === 'episode' && Season !== null && seriesID ? 
          <DisplayEpisodes imdbID={seriesID} season={Season} key={Season}/>
        : []
      }
    </div>
  )
}
