import { getKeyFormatter } from '@/lib/formatters';
import { ExistingMediaInfo } from '@/types';
import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
import ConfirmModal from '@/components/subcomponents/confirmModal';
import MediaInfo from '@/components/pages/mediaPage/mediaInfo';
import useCenteredItem from '@/hooks/useCenteredItem';
import { useRouter } from 'next/navigation';

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
  const [showDialog, setShowDialog] = useState(false);

  const { containerRef, centeredElement } = useCenteredItem<HTMLDivElement>();
  console.log(centeredElement?.dataset.index);
  const viewIndex = Number(centeredElement?.dataset.index);
  const router = useRouter();

  const scrollToCenter = (item: HTMLElement, container: HTMLElement) => {
    const itemCenter = item.offsetLeft + item.offsetWidth / 2;
    const containerCenter = container.clientWidth / 2;

    const scrollLeft = itemCenter - containerCenter;

    container.scrollTo({
      left: scrollLeft,
      behavior: 'smooth',
    });
  };

  return (
    <div className='overflow-x-scroll sticky flex gap-4 p-4 snap-x snap-mandatory'
      ref={containerRef}
    >
      {sorted.map((mediaInfo, i) => {
        return <div className={`max-w-full snap-item flex-shrink-0 flex flex-col gap-4 snap-center transition-transform duration-500 ${i === 0 ? 'ml-96' : ''} ${i === sorted.length - 1 ? 'mr-96' : ''} ${i === viewIndex ? '' : 'scale-50 opacity-50'}`}
        // return <div className={`snap-item flex-shrink-0 flex flex-col gap-4 snap-center transition-transform duration-500 ${i === 0 ? '' : ''} ${i === viewIndex ? 'border-red-500 border-2' : ''/*'scale-50 opacity-50'*/}`}
          onClick={(e) => {
            if (i === viewIndex) {
              setShowDialog(true);
            } else {
              if (!containerRef.current) return;
              scrollToCenter(e.currentTarget, containerRef.current);
            }
          }}
          data-index={i}
          key={i}
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
        router.push(`/media/${sorted[viewIndex].imdbId}`)
      }} key={viewIndex}>
        <div className='max-h-[75vh] overflow-auto'>
          {viewIndex > -1 ? <MediaInfo imdbId={sorted[viewIndex].imdbId}/> : undefined}
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
