import easyFetch from '@/lib/easyFetch';
import { Fragment, useEffect, useState } from 'react';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import Link from 'next/link';
import Loading from './loading';

interface Episode {
  Episode: string,
  Released: string,
  Title: string,
  imdbID: string,
  imdbRating: string,
}

interface SeasonResponse {
  Episodes: Episode[],
  Response: 'True' | 'False';
  Season: string,
  Title: string,
  totalSeasons: string,
}

export default function SeasonDisplay({
  imdbId,
  seasons,
  isEpisode
}: {
  imdbId: string,
  seasons: number,
  isEpisode?: boolean,
}) {
  const [seasonsInfo, setSeasonsInfo] = useState<SeasonResponse[]>();

  useEffect(() => {
    Promise.all(
      (isEpisode ? [ seasons ] : [...Array(seasons).keys()].map(i => i + 1))
        .map(seasonNum => {
          return easyFetch<SeasonResponse>('/api/search', 'GET', { 
            queryTerm: 'i', 
            searchTerm: imdbId, 
            queryType: 'season', 
            searchType: seasonNum, 
          })
        })
    ).then(seasons => setSeasonsInfo(seasons))
  }, [])

  function getAccordion(seasonInfo: SeasonResponse) {
    return <Accordion type='single' collapsible className='showOutline' key={`season-${seasonInfo.Season}`}>
      <AccordionItem value={`season-${seasonInfo.Season}`}>
        <AccordionTrigger className='px-4'>Season {seasonInfo.Season}</AccordionTrigger>
        <AccordionContent className='pb-0'>
          {seasonInfo.Episodes.map(episode => {
            return <Fragment key={episode.imdbID}>
              <hr /> 
              <Link href={`/media/${episode.imdbID}`}
                key={episode.imdbID}
                className='px-8 py-2 hover:bg-secondary flex gap-4'
              >
                <span>{episode.Episode}</span>
                <span className='flex-1 text-center'>{episode.Title}</span>
                <span>{episode.imdbRating}/10</span>
              </Link>
            </Fragment>
          })}
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  }

  return !seasonsInfo ? <Loading /> :
    isEpisode ? getAccordion(seasonsInfo[0]) :
      <Accordion type='single' collapsible className='showOutline'>
        <AccordionItem value='allSeasons'>
          <AccordionTrigger className='p-4'>Seasons 1 - {seasons}</AccordionTrigger>
          <AccordionContent className='px-8'>
            {seasonsInfo.map(seasonInfo => getAccordion(seasonInfo))}
          </AccordionContent>
        </AccordionItem>
      </Accordion>
}
