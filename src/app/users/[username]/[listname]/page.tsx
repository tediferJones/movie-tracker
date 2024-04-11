'use client';

import GetBreadcrumbs from '@/components/getBreadcrumbs';
import Loading from '@/components/loading';
import MyTable from '@/components/myTable/table';
import easyFetch from '@/lib/easyFetch';
import { ExistingMediaInfo, ListsRes } from '@/types';
import { useEffect, useState } from 'react';

export default function UserList({ params }: { params: { username: string, listname: string } }) {
  const { username, listname } = params;

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
