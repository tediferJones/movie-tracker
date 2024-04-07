'use client';

import Loading from '@/components/loading';
import easyFetch from '@/lib/easyFetch'
import { tableToCol } from '@/lib/tableToCol';
import Link from 'next/link';
import { useEffect, useState } from 'react';

export default function DistinctPage({ route }: { route: string }) {
  const [distinct, setDistinct] = useState<any[]>([]);

  useEffect(() => {
    easyFetch(`/api/${route}`, 'GET')
      .then((data: any) => setDistinct(data));
  }, []);

  return !distinct ? <Loading /> :
    <div className='showOutline px-4 w-4/5 m-auto flex flex-col mb-8'>
      {distinct.map((obj, i) => {
        return <Link 
          href={`/${route}/${obj[tableToCol[route]]}`}
          key={obj[tableToCol[route]]}
          className={`p-4 hover:underline ${i < distinct.length - 1 ? 'border-b' : ''}`}
        >{obj[tableToCol[route]]} ({ obj.count })</Link>
      })}
    </div>
}
