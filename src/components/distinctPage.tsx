'use client';

import { Input } from '@/components/ui/input';

import { useEffect, useState } from 'react';
import Loading from '@/components/loading';
import GetBreadcrumbs from '@/components/getBreadcrumbs';
import easyFetch from '@/lib/easyFetch'
import { fromCamelCase } from '@/lib/formatters';
import { tableToCol } from '@/lib/tableToCol';
import Link from 'next/link';

export default function DistinctPage({ route }: { route: string }) {
  const [distinct, setDistinct] = useState<any[]>();
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    easyFetch(`/api/${route}`, 'GET')
      .then((data: any) => setDistinct(data));
  }, []);

  return (
    <div className='w-4/5 m-auto'>
      <GetBreadcrumbs links={{'home': '/', [route]: `/${route}`}}/>
      <h1 className='text-2xl pb-4 text-center'>{fromCamelCase(route)}</h1>
      {!distinct ? <Loading /> :
        <>
          <Input className='mb-4'
            placeholder={`Search ${route}`}
            value={searchTerm}
            onChange={e => setSearchTerm(e.currentTarget.value)}
          />
          <div className='showOutline flex flex-col mb-8 overflow-hidden'>
            {distinct
              .filter(rec => rec[tableToCol[route]].toLowerCase().includes(searchTerm))
              .map((obj, i) => {
              return <Link 
                href={`/${route}/${obj[tableToCol[route]]}`}
                key={obj[tableToCol[route]]}
                className={`px-8 py-4 hover:underline hover:bg-secondary ${i < distinct.length - 1 ? 'border-b' : ''}`}
              >{obj[tableToCol[route]]} ({ obj.count })</Link>
            })}
          </div>
        </>
      }
    </div>
  )
}
