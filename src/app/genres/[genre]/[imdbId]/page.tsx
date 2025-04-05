'use client';

import MediaPage from '@/components/pages/mediaPage';
import GetBreadcrumbs from '@/components/subcomponents/getBreadcrumbs';
import Loading from '@/components/subcomponents/loading';
import easyFetchV3 from '@/lib/easyFetchV3';
import { useEffect, useState } from 'react';

type Params = { genre: string, imdbId: string }

export default function GenreMedia({ params }: { params: Params }) {
  const genre = decodeURIComponent(params.genre);
  const imdbId = decodeURIComponent(params.imdbId);
  const [title, setTitle] = useState('');

  useEffect(() => {
    easyFetchV3<string>({
      route: `/api/media/${imdbId}/title`,
      method: 'GET'
    }).then(data => {
        document.title = data;
        setTitle(data);
      });
  }, []);

  return (
    !title ? <Loading /> :
      <div className='w-4/5 m-auto mb-8 flex flex-col gap-4'>
        <GetBreadcrumbs crumbs={[
          { name: 'Home', link: '/' },
          { name: 'Genres', link: '/genres' },
          { name: genre, link: `/genres/${genre}` },
          { name: title, link: `/genres/${genre}/${imdbId}` },
        ]} />
        <MediaPage imdbId={imdbId} />
      </div>
  )
}
