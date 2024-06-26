'use client';

import { Input } from '@/components/ui/input';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import GetBreadcrumbs from '@/components/subcomponents/getBreadcrumbs';
import Loading from '@/components/subcomponents/loading';
import easyFetch from '@/lib/easyFetch'
import { tableToCol } from '@/lib/formatters';

export default function DistinctPage({ route }: { route: string }) {
  const [distinct, setDistinct] = useState<any[]>();
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    easyFetch(`/api/${route}`, 'GET')
      .then((data: any) => setDistinct(data));
  }, []);

  return (
    <div className='w-4/5 m-auto flex flex-col gap-4'>
      <GetBreadcrumbs links={{'home': '/', [route]: `/${route}`}}/>
      {!distinct ? <Loading /> :
        <>
          <Input placeholder={`Search ${route}`}
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
                >{obj[tableToCol[route]]} {obj.count ? `(${ obj.count })` : ''}</Link>
              })}
          </div>
        </>
      }
    </div>
  )
}
