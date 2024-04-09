'use client';

import Loading from '@/components/loading';
import MyTable from '@/components/myTable/table';
import GetBreadcrumbs from '@/components/getBreadcrumbs';
import easyFetch from '@/lib/easyFetch';
import { fromCamelCase } from '@/lib/formatters';
import { tableToCol } from '@/lib/tableToCol';
import { ExistingMediaInfo } from '@/types';
import { useEffect, useState } from 'react';

export default function TablePage({ route, propName }: { route: string, propName: any } ) {
  const [media, setMedia] = useState<ExistingMediaInfo[]>();
  propName = decodeURIComponent(propName)

  useEffect(() => {
    easyFetch<ExistingMediaInfo[]>(`/api/${route}`, 'GET', { [tableToCol[route]]: propName  })
      .then(data => setMedia(data))
  }, [])

  return (
    <div className='w-4/5 m-auto mb-8'>
      <GetBreadcrumbs links={{ home: '/', [route]: `/${route}`, [propName]: `/${route}/${propName}`}}/>
      <div className='text-center text-2xl pb-4'>
        {fromCamelCase(tableToCol[route])}: {fromCamelCase(propName)}
      </div>
      {!media ? <Loading /> : <MyTable data={media}/>}
    </div>
  )
}
