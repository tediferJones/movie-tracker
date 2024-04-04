import { ExistingMediaInfo } from '@/types';
import { ChevronLeft } from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

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
    return <span>
      {mediaInfo[key].map((val: string) => <span key={`${key}-${val}`}>
        <Link
          href={`/${key}/${val}`}
          className='hover:underline'
        >{val}</Link>{', '}
      </span>)}
    </span>
  }

  return (
    <>
      <tr className='border-t'>
        {keys.map(key => (
          <td key={`${mediaInfo.imdbId}-${key}`}
            className='text-center p-2'
          >{key ? mediaInfo[key] || 'N/A' : 
              <Button size='icon' variant='ghost'
                onClick={() => setIsOpen(!isOpen)}
              >
                <ChevronLeft className={`transition-all ${isOpen ? '-rotate-90' : 'rotate-0'}`}/>
              </Button>
            }
          </td>
        ))}
      </tr>
      <tr>
        <td colSpan={100}>
          <div className={`flex flex-col gap-4 bg-secondary overflow-hidden transition-all ${isOpen ? 'p-4 max-h-[9999px]' : 'max-h-[0px]'}`}>
            {details.map(key => <div key={key}>{key}: {getLinks(key)}</div>)}
          </div>
        </td>
      </tr>
    </>
  )
}
