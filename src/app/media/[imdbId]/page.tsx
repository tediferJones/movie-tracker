'use client';
import GetBreadcrumbs from '@/components/subcomponents/getBreadcrumbs';
import { useEffect, useState } from 'react';
import easyFetch from '@/lib/easyFetch';
import Loading from '@/components/subcomponents/loading';
import MediaPage from '@/components/pages/mediaPage';

export default function Media({ params }: { params: { imdbId: string } }) {
  const { imdbId } = params;
  const [title, setTitle] = useState('');

  useEffect(() => {
    easyFetch<string>({
      route: `/api/media/${imdbId}/title`,
      method: 'GET',
    }).then(data => {
        document.title = data;
        setTitle(data);
      });
  }, []);

  return !title ? <Loading /> :
    <div className='w-4/5 m-auto mb-8 flex flex-col gap-4'>
      <GetBreadcrumbs crumbs={[
        { name: 'Home', link: '/' },
        { name: 'Media', link: '/media' },
        { name: title, link: `/media/${imdbId}` },
      ]} />
      <MediaPage imdbId={imdbId} />
    </div>
}
