'use client';

import { useRouter } from 'next/navigation';
import easyFetch from '@/modules/easyFetch';

export default function LinkToMovie({ imdbID, children, className }: { imdbID: string, children: React.ReactNode, className?: string }) { // type should be ReactNode
  // console.log(props)
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
    <div className={className} onClick={checkDb}>{children}</div>

  )
}
