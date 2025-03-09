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

  // useEffect(() => {
  //   easyFetch<ListsRes>('/api/lists', 'GET', { username, listname })
  //     .then(data => {
  //       console.log('recieved', data)
  //       setListContents(data?.allMediaInfo || [])
  //     })
  // }, []);

  useEffect(() => {
    (async () => {
      const imdbIds = await easyFetch<string[]>('/api/lists', 'GET', { username, listname })
      console.log(imdbIds)
      // .then(imdbIds => {
      //   crawlList(imdbIds)
      // })
      const list = []
      for (let i = 0; i < imdbIds.length; i++) {
        // console.log('fetching', `/api/media?imdbId=${imdbIds[i]}`)
        // const mediaResult = await easyFetch(`/api/media?imdbId=${imdbIds[i]}`, 'GET')
        const mediaResult = await easyFetch<ExistingMediaInfo>(`/api/media`, 'GET', { imdbId: imdbIds[i] })
        list.push(mediaResult)
        console.log(i, imdbIds.length)
        // console.log(mediaResult)
        setListContents(list)
        // setListContents(listContents?.concat(mediaResult) || [ mediaResult ])
        // if (i > 3) break;
        // break;
      }
    })()
  }, []);

  async function crawlList(imdbIds: string[], i = 0) {
    if (i === imdbIds.length) return
    const result = await easyFetch<ExistingMediaInfo>(`/api/media/${imdbIds[i]}`, 'GET')
    setListContents(listContents?.concat(result) || [ result ])
    return crawlList(imdbIds, i + 1)
  }

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
