import { getKeyFormatter } from '@/lib/formatters';
import { ExistingMediaInfo } from '@/types';
import Link from 'next/link';

export default function SliderView(
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
    <div className='flex gap-4 overflow-x-auto'>
      {sorted.map(mediaInfo => {
        // return <img src={mediaInfo.poster || undefined} />
        return <div className='flex-shrink-0 flex flex-col gap-4'>
          <img className='aspect-auto my-auto' src={mediaInfo.poster || undefined} />
          <div className='bg-secondary rounded-lg flex flex-col items-center justify-center p-4'>
            <Link href={`${linkPrefix}/${mediaInfo.imdbId}`} className='hover:underline'>{mediaInfo.title}</Link>
            <div className='flex justify-between gap-4 w-full'>
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
        </div>
      })}
    </div>
  )
}
