'use client';
import GetBreadcrumbs from '@/components/subcomponents/getBreadcrumbs';
import { useEffect, useState } from 'react';
import easyFetchV3 from '@/lib/easyFetchV3';
import Loading from '@/components/subcomponents/loading';
import MediaPage from '@/components/pages/mediaPage';

export default function Media({ params }: { params: { imdbId: string } }) {
  const { imdbId } = params;
  const [title, setTitle] = useState('');

  useEffect(() => {
    easyFetchV3<string>({
      route: `/api/media/${imdbId}/title`,
      method: 'GET',
    }).then(data => setTitle(data))
  }, [])

  return !title ? <Loading /> :
    <div className='w-4/5 m-auto mb-8 flex flex-col gap-4'>
      <GetBreadcrumbs links={{
        home: '/',
        media: '/media',
        [title]: `/media/${imdbId}`
      }}/>
      <MediaPage imdbId={imdbId} />
    </div>
}
