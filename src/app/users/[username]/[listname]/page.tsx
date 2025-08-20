'use client';

import { useState } from 'react';
import GetBreadcrumbs from '@/components/subcomponents/getBreadcrumbs';
import Loading from '@/components/subcomponents/loading';
import MyTable from '@/components/table/myTable';
import { ExistingMediaInfo, Listname } from '@/types';
import easyFetch from '@/lib/easyFetch';
import useAsyncEffect from '@/hooks/useAsyncEffect';

export default function UserList({ params }: { params: { username: string, listname: string } }) {
  const username = decodeURIComponent(params.username);
  const listname = decodeURIComponent(params.listname);

  const [listContents, setListContents] = useState<ExistingMediaInfo[]>();

  useAsyncEffect(async () => {
    const lists = await easyFetch<Listname[]>({
      route: `/api/users/${username}/lists`,
      method: 'GET'
    });
    const matchingList = lists.find(list => list.listname === listname);
    if (!matchingList) throw Error('no list found with given listname');
    const listData = await easyFetch<ExistingMediaInfo[]>({
      route: `/api/users/${username}/lists/${matchingList.id}`,
      method: 'GET'
    });
    setListContents(listData);
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
