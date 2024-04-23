'use client';

import { useEffect, useState } from 'react';
import GetBreadcrumbs from '@/components/subcomponents/getBreadcrumbs';
import Loading from '@/components/subcomponents/loading';
import MyTable from '@/components/table/myTable';
import easyFetch from '@/lib/easyFetch';
import { ExistingMediaInfo, ListsRes } from '@/types';

export default function UserList({ params }: { params: { username: string, listname: string } }) {
  const username = decodeURIComponent(params.username);
  const listname = decodeURIComponent(params.listname);

  const [listContents, setListContents] = useState<ExistingMediaInfo[]>();

  useEffect(() => {
    easyFetch<ListsRes>('/api/lists', 'GET', { username, listname })
      .then(data => setListContents(data.allMediaInfo || []))
  }, []);

  return (
    <div className='w-4/5 m-auto mb-8 flex flex-col gap-4'>
      <GetBreadcrumbs links={{
        home: '/',
        users: '/users',
        [username]: `/users/${username}`,
        [listname]: `/users/${username}/${listname}`
      }}/>
      {!listContents ? <Loading /> : <MyTable data={listContents}/>}
    </div>
  )
}
