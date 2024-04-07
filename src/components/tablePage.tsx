'use client';

import Loading from '@/components/loading';
import MyTable from '@/components/myTable/table';
import easyFetch from '@/lib/easyFetch';
import { tableToCol } from '@/lib/tableToCol';
import { ExistingMediaInfo } from '@/types';
import { useEffect, useState } from 'react';

export default function TablePage({ route, propName }: { route: string, propName: any } ) {
  const [media, setMedia] = useState<ExistingMediaInfo[]>();

  useEffect(() => {
    easyFetch<ExistingMediaInfo[]>(`/api/${route}`, 'GET', { [tableToCol[route]]: decodeURIComponent(propName)  })
      .then(data => setMedia(data))
  }, [])

  return !media ? <Loading /> :
    <div className='w-4/5 m-auto mb-8'>
      <MyTable data={media}/>
    </div>
}
