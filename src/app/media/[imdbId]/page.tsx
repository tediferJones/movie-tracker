'use client';
// import DisplayFullMediaInfo from '@/OLD-components/DisplayFullMediaInfo';

import easyFetch from '@/lib/easyFetch';
import { useEffect } from 'react';

export default function Media({ params }: { params: { imdbId: string } }) {
  useEffect(() => {
    easyFetch('/api/media', 'GET', { imdbId: params.imdbId });
  })

  return (
    <div>{params.imdbId}</div>
  )

  // return <DisplayFullMediaInfo imdbID={imdbID} />
}
