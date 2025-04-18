import { getKeyFormatter } from '@/lib/formatters';
import { ExistingMediaInfo } from '@/types';
import Link from 'next/link';
import { useState } from 'react';
import ConfirmModal from '@/components/subcomponents/confirmModal';
import MediaInfo from '@/components/pages/mediaPage/mediaInfo';

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
  const [viewIndex, setViewIndex] = useState(0);
  const [showDialog, setShowDialog] = useState(false);
  return (
    <div className='flex gap-4 p-4 snap-x snap-mandatory'/* onClick={() => setViewIndex(viewIndex + 1)}*/>
      {/*
      {sorted.map((_, i) => {
        return <div className="w-64 h-64 bg-red-400 shrink-0 rounded-lg snap-center">{i}</div>
      })}
      */}
      {sorted.map((mediaInfo, i) => {
        return <div className={`flex-shrink-0 flex flex-col gap-4 snap-center ${i === viewIndex ? '' : 'scale-50 opacity-50'}`}
          onClick={() => {
            if (i === viewIndex) setShowDialog(true)
          }}
        >
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
      <ConfirmModal visible={showDialog} setVisible={setShowDialog} action={() => {
        console.log('navigate to media page')
      }}>
        <div className='max-h-[75vh] overflow-auto'>
          <MediaInfo imdbId={sorted[viewIndex].imdbId}/>
        </div>
      </ConfirmModal>
    </div>
  )
}

/*
<div className='flex gap-4 p-4 snap-x snap-mandatory'>
  {sorted.map((_, i) => {
    return <div className="w-64 h-64 bg-red-400 shrink-0 rounded-lg snap-center">{i}</div>
  })}
</div>
 * */
