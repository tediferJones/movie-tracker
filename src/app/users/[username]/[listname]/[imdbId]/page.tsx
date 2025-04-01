'use client';

import MediaPage from '@/components/pages/mediaPage';
import GetBreadcrumbs from '@/components/subcomponents/getBreadcrumbs';
import Loading from '@/components/subcomponents/loading';
import easyFetchV3 from '@/lib/easyFetchV3';
import { useEffect, useState } from 'react';

type Params = { username: string, listname: string, imdbId: string }

export default function UserListItem({ params }: { params: Params }) {
  const username = decodeURIComponent(params.username);
  const listname = decodeURIComponent(params.listname);
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
          { name: 'Users', link: '/users' },
          { name: username, link: `/users/${username}` },
          { name: listname, link: `/users/${username}/${listname}` },
          { name: title, link: `/users/${username}/${listname}/${imdbId}` },
        ]} />
        <MediaPage imdbId={imdbId} />
      </div>
  )
}
