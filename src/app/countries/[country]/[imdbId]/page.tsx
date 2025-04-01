'use client';

import MediaPage from '@/components/pages/mediaPage';
import GetBreadcrumbs from '@/components/subcomponents/getBreadcrumbs';
import Loading from '@/components/subcomponents/loading';
import easyFetchV3 from '@/lib/easyFetchV3';
import { useEffect, useState } from 'react';

type Params = { country: string, imdbId: string }

export default function GenreMedia({ params }: { params: Params }) {
  const country = decodeURIComponent(params.country);
  const imdbId = decodeURIComponent(params.imdbId);
  const [title, setTitle] = useState('');

  useEffect(() => {
    easyFetchV3<string>({
      route: `/api/media/${imdbId}/title`,
      method: 'GET'
    }).then(data => setTitle(data));
  }, []);

  return (
    !title ? <Loading /> :
      <div className='w-4/5 m-auto mb-8 flex flex-col gap-4'>
        <GetBreadcrumbs crumbs={[
          { name: 'Home', link: '/' },
          { name: 'Countries', link: '/countries' },
          { name: country, link: `/countries/${country}` },
          { name: title, link: `/countries/${country}/${imdbId}` },
        ]} />
        <MediaPage imdbId={imdbId} />
      </div>
  )
}
