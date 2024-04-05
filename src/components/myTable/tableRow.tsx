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
  
  function getLinks(key: string) {
    if (!mediaInfo[key] || mediaInfo[key].length === 0) return 'N/A'
    return mediaInfo[key].map((val: string) => (
      <span key={`${key}-${val}`}>
        <Link href={`/${key}/${val}`}
          className='hover:underline'
        >{val}</Link>{', '}
      </span>
    ))
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
                keyFormatter[key] ? keyFormatter[key](mediaInfo[key]) : mediaInfo[key]
            }
          </td>
        ))}
      </tr>
      <tr>
        <td colSpan={100} className='p-0'>
          <div className={`grid grid-cols-2 gap-4 overflow-hidden transition-all ${isOpen ? 'p-4 border-t max-h-[9999px]' : 'max-h-[0px]'}`}>
            {details.map(key => <div key={key} className='flex flex-wrap gap-2 justify-center items-center'>
              {fromCamelCase(key)}: {getLinks(key)}</div>)
            }
          </div>
        </td>
      </tr>
    </>
  )
}
