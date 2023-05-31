'use client';

import { useRouter } from 'next/navigation';
import easyFetch from '@/modules/easyFetch';

export default function LinkToMovie(props: any) {
  const { imdbID } = props;
  const router = useRouter();

  async function checkDb() {
    // Check if movie is in DB, if the movie isnt present in the DB, add it, then redirect user to /movies/[imdbID]
    const checkForMovie = await easyFetch('/api/movies', 'HEAD', { imdbID })
    if ([404, 200].includes(checkForMovie.status)) {
      if (checkForMovie.status === 404) {
        await easyFetch('/api/movies', 'POST', { imdbID })
      }
      router.push(`/movies/${imdbID}`)
    }
  }

  // TO DO THIS WITH API ROUTES
  // if status === 200, GET request to /movies/[imdbID]
  // if status === 404, POST request to /movies/[imdbID] then send a get request with the same imdbID
  // if status === 400, still do nothing

  return (
    <button onClick={checkDb}>NEW LINK</button>
  )
}
