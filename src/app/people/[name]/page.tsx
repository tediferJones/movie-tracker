'use client';

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger
} from '@/components/ui/accordion';

import GetBreadcrumbs from '@/components/subcomponents/getBreadcrumbs';
import Loading from '@/components/subcomponents/loading';
import MyTable from '@/components/table/myTable';
import easyFetch from '@/lib/easyFetch';
import { fromCamelCase } from '@/lib/formatters';
import { ExistingMediaInfo } from '@/types';
import { useEffect, useState } from 'react';

type PersonMedia = { [key: string]: ExistingMediaInfo[] };

export default function Person({ params }: { params: { name: string } }) {
  const name = decodeURIComponent(params.name);
  const [peopleMedia, setPeopleMedia] = useState<PersonMedia>();

  useEffect(() => {
    easyFetch<PersonMedia>('/api/people', 'GET', { name })
      .then(data => setPeopleMedia(data));
  }, []);

  return (
    <div className='w-4/5 m-auto mb-8'>
      <GetBreadcrumbs links={{
        home: '/',
        people: '/people',
        [name]: `/people/${name}`
      }}/>
      <div className='text-center text-2xl border-b py-4'>{name}</div>
      {!peopleMedia ? <Loading /> :
      <Accordion type='single' collapsible>
        {['actor', 'director', 'writer'].map(position => {
          return (
            <AccordionItem value={position} key={position}>
              <AccordionTrigger>
                {fromCamelCase(position)} ({peopleMedia[position].length})
              </AccordionTrigger>
              <AccordionContent>
                <MyTable data={peopleMedia[position]} linkPrefix={`/people/${name}`} />
              </AccordionContent>
            </AccordionItem>
          )
        })}
      </Accordion>}
    </div>
  )
}
