'use client';

import Loading from '@/components/loading';
import easyFetch from '@/lib/easyFetch'
import Link from 'next/link';
import { useEffect, useState } from 'react';

type DistinctGenre = { genre: string, count: number }

export default function Genres() {
  const [distinctGenres, setDistinctGenres] = useState<DistinctGenre[]>([]);

  useEffect(() => {
    easyFetch<{ genre: string, count: number }[]>('/api/genres', 'GET')
      .then(data => setDistinctGenres(data));
  }, []);

  return !distinctGenres ? <Loading /> :
    <div className='showOutline px-4 w-4/5 m-auto flex flex-col mb-8'>
      {distinctGenres.map(({ genre, count }, i) => {
        return <Link 
          href={`/genres/${genre}`}
          key={genre}
          className={`p-4 hover:underline ${i < distinctGenres.length - 1 ? 'border-b' : ''}`}
        >{genre} ({ count })</Link>
      })}
    </div>
}
