'use client';

import Loading from '@/components/loading';
import { columns } from '@/components/mediaTable/columns';
import { MediaTable } from '@/components/mediaTable/table';
import MyTable from '@/components/myTable/table';
import easyFetch from '@/lib/easyFetch';
import { ExistingMediaInfo } from '@/types';
import { useEffect, useState } from 'react';

export default function UserList({ params }: { params: { username: string, listname: string } }) {
  const { username, listname } = params;

  const [listContents, setListContents] = useState<ExistingMediaInfo[]>();

  useEffect(() => {
    easyFetch<ExistingMediaInfo[]>('/api/lists', 'GET', { username, listname })
      .then(data => setListContents(data))

    // easyFetch<string[]>(`/api/users/${username}/lists/${listname}`, 'GET')
    //   .then(listData => {
    //     Promise.all(listData.map(async imdbId => easyFetch<ExistingMediaInfo>(`/api/media`, 'GET', { imdbId })))
    //       .then(allMediaInfo => setListContents(allMediaInfo))
    //   });
    // (async () => {
    //   const listData = await easyFetch<string[]>(`/api/users/${username}/lists/${listname}`, 'GET')
    //   const mediaInfo = await Promise.all(listData.map(
    //     async imdbId => easyFetch<ExistingMediaInfo>(`/api/media`, 'GET', { imdbId })
    //   ));
    //   setListContents(mediaInfo)
    // })()
  }, [])

  return (
    <div className='w-4/5 m-auto'>
      {!listContents ? <Loading /> : 
        <>
          <MyTable data={listContents}/>
          <MediaTable 
            columns={columns}
            data={listContents}
          />
        </>
      }
    </div>
  )
}

// import prisma from '@/client';
// import { lists, media } from '@prisma/client';
// import SortFilterMedia from '@/components/SortFilterMedia';
// 
// type listMediaID = Pick<lists, 'imdbID'>
// 
// export default async function listname({
//   params,
// }: {
//   params: {
//     username: string,
//     listname: string,
//   },
// }) {
//   const username = decodeURI(params.username)
//   const listname = decodeURI(params.listname)
// 
//   const listMediaIDs: listMediaID[] = await prisma.lists.findMany({
//     select: {
//       imdbID: true
//     },
//     where: {
//       username,
//       listname,
//     }
//   });
//   const mediaArr: media[] = await prisma.media.findMany({ 
//     where: {
//       imdbID: {
//         in: listMediaIDs.map((listMedia: listMediaID) => listMedia.imdbID),
//       },
//     },
//   });
// 
//   return (
//     <div>
//       <h1>Specific list page</h1>
//       <h1>Put a SortFilterMedia component here and read in list data</h1>
//       <SortFilterMedia mediaArr={mediaArr} columns={{}}/>
//     </div>
//   )
// }
