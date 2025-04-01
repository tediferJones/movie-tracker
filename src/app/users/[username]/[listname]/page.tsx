'use client';

import { useEffect, useState } from 'react';
import GetBreadcrumbs from '@/components/subcomponents/getBreadcrumbs';
import Loading from '@/components/subcomponents/loading';
import MyTable from '@/components/table/myTable';
import { ExistingMediaInfo } from '@/types';
import easyFetchV3 from '@/lib/easyFetchV3';

export default function UserList({ params }: { params: { username: string, listname: string } }) {
  const username = decodeURIComponent(params.username);
  const listname = decodeURIComponent(params.listname);

  const [listContents, setListContents] = useState<ExistingMediaInfo[]>();

  useEffect(() => {
    easyFetchV3<ExistingMediaInfo[]>({
      route: `/api/users/${username}/lists/${listname}`,
      method: 'GET'
    }).then(data => setListContents(data));
  }, []);

  return (
    <div className='w-4/5 m-auto mb-8 flex flex-col gap-4'>
      <GetBreadcrumbs crumbs={[
        { name: 'Home', link: '/' },
        { name: 'Users', link: '/users' },
        { name: username, link: `/users/${username}` },
        { name: listname, link: `/users/${username}/${listname}` },
      ]} />
      {!listContents ? <Loading /> : <MyTable data={listContents} linkPrefix={`/users/${username}/${listname}`}/>}
    </div>
  )
}
