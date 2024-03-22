'use client';
// import DisplayFullMediaInfo from '@/OLD-components/DisplayFullMediaInfo';

import easyFetch from '@/lib/easyFetch';
import { FormattedMediaInfo } from '@/types';
import { useEffect, useState } from 'react';

export default function Media({ params }: { params: { imdbId: string } }) {
  const [media, setMedia] = useState<FormattedMediaInfo>();

  useEffect(() => {
    easyFetch<FormattedMediaInfo>('/api/media', 'GET', { imdbId: params.imdbId })
      .then(data => {
        console.log(data)
        setMedia(data)
      })
  }, [])

  return (
    <div>
      <p>{params.imdbId}</p>
      {/*
      <p>{JSON.stringify(media, null, 2)}</p>
      */}
      {Object.keys(media || {}).map(key => {
        // return <p key={key}>{key}: {media[key].toString()}</p>
        return <div key={key}>
          <div>{key}</div>
          { // @ts-ignore
            Object.keys(media[key]).map(itemKey => {
              // @ts-ignore
              return <p key={itemKey}>{itemKey}: {media[key][itemKey]}</p>
          })}
        </div>
      })}
    </div>
  )

  // return <DisplayFullMediaInfo imdbID={imdbID} />
}
