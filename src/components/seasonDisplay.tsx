import easyFetch from "@/lib/easyFetch"
import { useEffect } from "react"

export default function SeasonDisplay({
  imdbId,
  seasons,
  isEpisode
}: {
  imdbId: string,
  seasons: number,
  isEpisode?: boolean,
}) {
  useEffect(() => {
    console.log([ isEpisode ? seasons : [...Array(seasons).keys()].map(i => i + 1)])
    easyFetch('/api/search', 'GET', { 
      queryTerm: 'i', 
      searchTerm: imdbId, 
      queryType: 'season', 
      searchType: NaN, 
    })
  }, [])

  return (
    <div className='p-4 border text-center'>
      <p>Display Season info</p>
      DISPLAY SEASONS IF ITS A SERIES
      <div>
        If type is series and has multiple seasons:
        Seasons 1 - # {'->'} Seasons {'->'} Episodes
        <br />

        If type is series and only has 1 season
        Season 1 {'->'} Episodes
        <br />

        If type is episode
        Season # {'->'} Episodes

        <br />
        To fetch season info, extract season info from media and fetch like so
        {`easyFetch('/api/search', 'GET', { 
          queryTerm: 'i', 
          searchTerm: imdbID, 
          queryType: 'season', 
          searchType: SEASON-NUMBER, 
        })`}
      </div>
    </div>
  )
}
