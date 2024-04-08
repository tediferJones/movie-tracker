'use client';

import Loading from "@/components/loading";
import MyTable from "@/components/myTable/table";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import easyFetch from "@/lib/easyFetch";
import { fromCamelCase } from "@/lib/formatters";
import { ExistingMediaInfo } from "@/types";
import { useEffect, useState } from "react";

type PersonMedia = { [key: string]: ExistingMediaInfo[] };

export default function Person({ params }: { params: { name: string } }) {
  const name = decodeURIComponent(params.name)
  const [peopleMedia, setPeopleMedia] = useState<PersonMedia>()

  useEffect(() => {
    easyFetch<PersonMedia>('/api/people', 'GET', { name })
      .then(data => setPeopleMedia(data))
  }, [])

  return !peopleMedia ? <Loading /> :
    <div className='w-4/5 m-auto mb-8'>
      <div className='text-center text-2xl border-b py-4'>{name}</div>
      <Accordion type='single' collapsible>
        {['actor', 'director', 'writer'].map(position => {
          return (
            <AccordionItem value={position} key={position}>
              <AccordionTrigger>
                {fromCamelCase(position)} ({peopleMedia[position].length})
              </AccordionTrigger>
              <AccordionContent>
                <MyTable data={peopleMedia[position]} />
              </AccordionContent>
            </AccordionItem>
          )
        })}
      </Accordion>
    </div>
}
