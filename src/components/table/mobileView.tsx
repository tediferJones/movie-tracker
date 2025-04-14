import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger
} from '@/components/ui/accordion';

import Link from 'next/link';
import GetLinks from '@/components/subcomponents/getLinks';
import { details } from '@/components/table/myTable';
import { fromCamelCase, getKeyFormatter } from '@/lib/formatters';
import { ExistingMediaInfo } from '@/types';

export default function MobileView(
  {
    sorted,
    linkPrefix,
    totalLength,
  }: {
    sorted: ExistingMediaInfo[],
    linkPrefix: string,
    totalLength: number,
  }
) {
  return (
    <Accordion type='multiple'>
      {totalLength === 0 ? <div className='text-center text-muted-foreground'>No Data Found</div> :
        sorted.length === 0 ? <div className='text-center text-muted-foreground'>No Results Found</div> :
          sorted.map(mediaInfo => {
            return (
              <AccordionItem value={mediaInfo.imdbId} key={mediaInfo.imdbId}>
                <AccordionTrigger className='hover:no-underline px-2 flex gap-2'>
                  <div className='flex flex-col gap-2 w-full'>
                    <Link className='w-fit m-auto' href={`${linkPrefix}/${mediaInfo.imdbId}`}>
                      {mediaInfo.title}
                    </Link>
                    <div className='flex gap-4 justify-between'>
                      {['rated', 'startYear', 'runtime'].map(key => (
                        <div className='flex-1 text-center'
                          key={`${mediaInfo.imdbId}-${key}`}
                        >
                          {!mediaInfo[key] ? 'N/A' :
                            getKeyFormatter[key] ? getKeyFormatter[key](mediaInfo[key]) : mediaInfo[key]
                          }
                        </div>
                      ))}
                    </div>
                  </div>
                </AccordionTrigger>
                <AccordionContent className='flex flex-col gap-2'>
                  <div className='flex justify-between px-2'>
                    {['imdbRating', 'tomatoRating', 'metaRating'].map(key => (
                      <div className='flex flex-wrap gap-1 justify-center items-center'
                        key={`${mediaInfo.imdbId}-${key}`}
                      >
                        <span>{fromCamelCase(key)}:</span>
                        <span>{getKeyFormatter[key](mediaInfo[key])}</span>
                      </div>
                    ))}
                  </div>
                  <img src={mediaInfo.poster || undefined} />
                  {details.map(key => (
                    <div className='grid grid-cols-4' key={`${mediaInfo.imdbId}-${key}`}>
                      <span className='col-span-1 text-center m-auto text-muted-foreground'>{fromCamelCase(key)}:</span>
                      <div className='col-span-3 text-center'>
                        <GetLinks type={key} arr={mediaInfo[key]}/>
                      </div>
                    </div>
                  ))}
                </AccordionContent>
              </AccordionItem>
            )
          })}
    </Accordion>
  )}
