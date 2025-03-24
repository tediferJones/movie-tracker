'use client';

import { useEffect, useState } from 'react';
import GetBreadcrumbs from '@/components/subcomponents/getBreadcrumbs';
import Loading from '@/components/subcomponents/loading';
import MyTable from '@/components/table/myTable';
import easyFetch from '@/lib/easyFetch';
import { tableToCol } from '@/lib/formatters';
import { ExistingMediaInfo } from '@/types';

export default function TablePage({ route, propName }: { route: string, propName: any } ) {
  const [media, setMedia] = useState<ExistingMediaInfo[]>();
  propName = decodeURIComponent(propName);

  useEffect(() => {
    easyFetch<ExistingMediaInfo[]>(`/api/${route}`, 'GET', { [tableToCol[route]]: propName  })
      .then(data => setMedia(data));
  }, [])

  return (
    <div className='w-4/5 m-auto mb-8 flex flex-col gap-4'>
      <GetBreadcrumbs links={{ home: '/', [route]: `/${route}`, [propName]: `/${route}/${propName}`}}/>
      {!media ? <Loading /> : <MyTable data={media} linkPrefix={`/${route}/${propName}`} />}
    </div>
  )
}
