'use client';

import Loading from '@/components/loading';
import MyTable from '@/components/myTable/table';
import easyFetch from '@/lib/easyFetch';
import { ExistingMediaInfo } from '@/types';
import { useEffect, useState } from 'react';

export default function Genre({ params }: { params: { genre: string } } ) {
  const { genre } = params;
  const [media, setMedia] = useState<ExistingMediaInfo[]>();

  useEffect(() => {
    easyFetch<ExistingMediaInfo[]>('/api/genres', 'GET', { genre })
      .then(data => setMedia(data))
  }, [])

  return !media ? <Loading /> :
    <div className='w-4/5 m-auto mb-8'>
      <MyTable data={media}/>
    </div>
}
