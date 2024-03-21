'use client';

import DisplayEpisodes from "@/components/DisplayEpisodes";
import DisplayDropDown from '@/components/DisplayDropDown';

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
  function nestedDropDown(): JSX.Element[] {
    return [...Array(totalSeasons).keys()].map((season: number) => {
      return <DisplayEpisodes imdbID={imdbID} 
        season={season + 1} 
        key={season + 1} 
      />
    })
  }

  return (
    <div className='my-4 mx-auto w-4/5'>
      {Type === 'series' && totalSeasons && totalSeasons > 1 ?
        <DisplayDropDown header={`Seasons 1 - ${totalSeasons}`} 
          content={nestedDropDown()} 
          hideContentCount={true} 
        />
      : Type === 'series' && totalSeasons && totalSeasons === 1 ? 
        <DisplayEpisodes imdbID={imdbID} 
          season={totalSeasons} 
          key={totalSeasons}/>
      : Type === 'episode' && Season !== null && seriesID ? 
        <DisplayEpisodes imdbID={seriesID} 
          season={Season} 
          key={Season}
        />
      : []}
    </div>
  )
}
