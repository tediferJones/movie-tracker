import { ChevronLeft } from 'lucide-react';
import { useState } from 'react';
import Link from 'next/link';
import GetLinks from '@/components/subcomponents/getLinks';
import { Button } from '@/components/ui/button';
import { fromCamelCase, getKeyFormatter } from '@/lib/formatters';
import { ExistingMediaInfo } from '@/types';

export default function TableRow(
  {
    mediaInfo,
    keys,
    details,
    linkPrefix,
  }: {
    mediaInfo: ExistingMediaInfo,
    keys: string[],
    details: string[],
    linkPrefix: string,
  }
) {
  const [isOpen, setIsOpen] = useState(false);
  
  const dropDownTrigger = (
    <Button size='icon' variant='ghost' onClick={() => setIsOpen(!isOpen)}>
      <span className='sr-only'>Expand row</span>
      <ChevronLeft className={`transition-all ${isOpen ? '-rotate-90' : 'rotate-0'}`}/>
    </Button>
  )

  return (
    <>
      <tr className={`border-t hover:bg-secondary ${isOpen ? 'bg-primary-foreground' : ''}`} onClick={() => setIsOpen(!isOpen)}>
        {keys.map(key => (
          <td key={`${mediaInfo.imdbId}-${key}`} className='text-center p-2'>
            {!key ? dropDownTrigger :
              !mediaInfo[key] ? 'N/A' :
                key === 'title' ? <Link className='hover:underline'
                  href={`${linkPrefix}/${mediaInfo.imdbId}`}
                  onClick={(e) => e.stopPropagation()}
                >{mediaInfo[key]}</Link>
                : getKeyFormatter[key] ? getKeyFormatter[key](mediaInfo[key]) : mediaInfo[key]
            }
          </td>
        ))}
      </tr>
      <tr>
        <td colSpan={100} className='p-0'>
          <div className={`rounded-lg bg-primary-foreground flex gap-4 justify-center items-center overflow-hidden transition-all ${isOpen ? 'p-4 border-t max-h-[9999px]' : 'max-h-[0px]'}`}>
            <img className={`h-48 ${isOpen ? 'opacity-100' : 'opacity-0'} transition-opacity`} src={mediaInfo.poster || undefined} />
            <div className={`grid grid-cols-2 gap-4`}>
              {details.map(key => (
                <div key={key} className='flex flex-wrap justify-center items-center gap-1'>
                  <span>{fromCamelCase(key)}:</span>
                  <GetLinks type={key} arr={mediaInfo[key]} />
                </div>
              ))}
            </div>
          </div>
        </td>
      </tr>
    </>
  )
}
