import { ExistingMediaInfo } from '@/types';
import { ChevronLeft } from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { formatRating, formatRuntime, fromCamelCase } from '@/lib/formatters';

export default function TableRow({
  mediaInfo,
  keys,
  details
}: {
  mediaInfo: ExistingMediaInfo,
  keys: string[],
  details: string[]
}) {
  const [isOpen, setIsOpen] = useState(false);
  
  const keyParam: { [key: string]: string } = {
    director: 'people',
    writer: 'people',
    actor: 'people',
    genre: 'genres',
    country: 'countries',
    language: 'languages',
  }

  function getLinks(key: string) {
    if (!mediaInfo[key] || mediaInfo[key].length === 0) return 'N/A'
    return mediaInfo[key].map((val: string, i: number, arr: string[]) => (
      <span key={`${key}-${val}`}>
        {i === 0 ? '' : i < arr.length - 1 ? ', ' : <span className='px-1'>and</span>}
        <Link href={`/${keyParam[key]}/${val}`}
          className='hover:underline'
        >{val}</Link>
      </span>
    )) /*{', '}*/
  }

  const keyFormatter: { [key: string]: Function } = {
    imdbRating: formatRating.imdbRating,
    metaRating: formatRating.metaRating,
    tomatoRating: formatRating.tomatoRating,
    runtime: formatRuntime,
  }

  const dropDownTrigger = (
    <Button size='icon' variant='ghost' onClick={() => setIsOpen(!isOpen)}>
      <ChevronLeft className={`transition-all ${isOpen ? '-rotate-90' : 'rotate-0'}`}/>
    </Button>
  )

  return (
    <>
      <tr className='border-t hover:bg-secondary'>
        {keys.map(key => (
          <td key={`${mediaInfo.imdbId}-${key}`} className='text-center p-2'>
            {!key ? dropDownTrigger :
              !mediaInfo[key] ? 'N/A' :
                key === 'title' ? <Link className='hover:underline' href={`/media/${mediaInfo.imdbId}`}>{mediaInfo[key]}</Link> :
                  keyFormatter[key] ? keyFormatter[key](mediaInfo[key]) : mediaInfo[key]
            }
          </td>
        ))}
      </tr>
      <tr>
        <td colSpan={100} className='p-0'>
          <div className={`grid grid-cols-2 gap-4 overflow-hidden transition-all ${isOpen ? 'p-4 border-t max-h-[9999px]' : 'max-h-[0px]'}`}>
            {details.map(key => <div key={key}
              className='flex flex-wrap justify-center items-center'
            >
              <span className='px-1'>{fromCamelCase(key)}:</span>{getLinks(key)}
            </div>)}
          </div>
        </td>
      </tr>
    </>
  )
}
