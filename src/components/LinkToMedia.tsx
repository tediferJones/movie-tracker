'use client';

import { useRouter } from 'next/navigation';
import easyFetch from '@/modules/easyFetch';

export default function LinkToMovie(props: { imdbID: string }) {
  const { imdbID } = props;
  const router = useRouter();

  async function checkDb() {
    // Check if movie is in DB, if the movie isnt present in the DB, add it, then redirect user to /media/[imdbID]
    const checkForMovie = await easyFetch('/api/media', 'HEAD', { imdbID })

    if (checkForMovie.status === 404) {
      await easyFetch('/api/media', 'POST', { imdbID })
    }

    router.push(`/media/${imdbID}`)
  }

  return (
    <button onClick={checkDb}>NEW LINK</button>
  )
}
