'use client';

import Loading from '@/components/loading';
import MyTable from '@/components/myTable/table';
import easyFetch from '@/lib/easyFetch';
import { fromCamelCase } from '@/lib/formatters';
import { tableToCol } from '@/lib/tableToCol';
import { ExistingMediaInfo } from '@/types';
import { useEffect, useState } from 'react';

export default function TablePage({ route, propName }: { route: string, propName: any } ) {
  const [media, setMedia] = useState<ExistingMediaInfo[]>();

  useEffect(() => {
    easyFetch<ExistingMediaInfo[]>(`/api/${route}`, 'GET', { [tableToCol[route]]: decodeURIComponent(propName)  })
      .then(data => setMedia(data))
  }, [])

  return (
    <div className='w-4/5 m-auto mb-8'>
      <div className='text-center text-2xl pb-4'>
        {fromCamelCase(tableToCol[route])}: {fromCamelCase(propName)}
      </div>
      {!media ? <Loading /> : <MyTable data={media}/>}
    </div>
  )
}
