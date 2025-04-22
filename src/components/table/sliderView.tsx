import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import ConfirmModal from '@/components/subcomponents/confirmModal';
import MediaInfo from '@/components/pages/mediaPage/mediaInfo';
import useCenteredItem from '@/hooks/useCenteredItem';
import { getKeyFormatter } from '@/lib/formatters';
import { ExistingMediaInfo } from '@/types';
import { ScrollBar } from '../ui/scroll-area';

import * as ScrollAreaPrimitive from '@radix-ui/react-scroll-area';
import { forwardRef } from 'react';

export const CustomScrollArea = forwardRef<HTMLDivElement, React.ComponentPropsWithoutRef<typeof ScrollAreaPrimitive.Viewport>>(
  ({ children, ...props }, ref) => (
    <ScrollAreaPrimitive.Root className='w-full overflow-hidden' type='auto'>
      <ScrollAreaPrimitive.Viewport ref={ref} className='snap-x snap-mandatory w-full whitespace-nowrap'>
        <div {...props}>
          {children}
        </div>
      </ScrollAreaPrimitive.Viewport>
      <ScrollAreaPrimitive.Scrollbar orientation='horizontal' />
    </ScrollAreaPrimitive.Root>
  )
);
CustomScrollArea.displayName = 'CustomScrollArea';


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
  console.log({ centeredElement })
  const viewIndex = Number(centeredElement?.dataset.index);
  const router = useRouter();

  function scrollToCenter(item: HTMLElement, container: HTMLElement) {
    const itemCenter = item.offsetLeft + item.offsetWidth / 2;
    const containerCenter = container.clientWidth / 2;

    const scrollLeft = itemCenter - containerCenter;

    container.scrollTo({
      left: scrollLeft,
      behavior: 'smooth',
    });
  };

  function autoScroll(from: number, to: number, delay: number) {
    if (from === to) return
    const newIndex = from > to ? from - 1 : from + 1;

    const current = document.querySelector<HTMLDivElement>(`[data-index='${newIndex}']`)
    if (!current) throw Error('cant find it')
    if (!containerRef.current) throw Error('no container')
    scrollToCenter(current, containerRef.current)

    setTimeout(() => autoScroll(newIndex, to, delay), delay)
  }

  return (
    <CustomScrollArea className='flex gap-4 p-4 snap-x snap-mandatory'
      ref={containerRef}
    >
      <div className='w-screen shrink-0'></div>
      {sorted.map((mediaInfo, i) => {
        // return <div className={`max-w-[50%] max-h-[90vh] snap-item flex-shrink-0 flex flex-col items-center justify-center gap-4 snap-center transition-transform duration-500 ${i === 0 ? 'ml-[100vw]' : ''} ${i === sorted.length - 1 ? 'mr-[100vw]' : ''} ${i === viewIndex ? '' : 'scale-50 opacity-50'}`}
        return <div className={`sm:max-w-max max-w-36 max-h-[90vh] snap-item flex-shrink-0 flex flex-col items-center justify-center gap-4 snap-center transition-transform duration-500 ${i === viewIndex ? '' : 'scale-50 opacity-50'}`}
          onClick={(e) => {
            if (i === viewIndex) {
              setShowDialog(true);
            } else {
              if (!containerRef.current) return;
              scrollToCenter(e.currentTarget, containerRef.current);

              // const clickedIndex = Number(e.currentTarget.dataset.index);
              // console.log(viewIndex, clickedIndex);
              // autoScroll(viewIndex, clickedIndex, 500);
            }
          }}
          data-index={i}
          key={i}
        >
          <img className='aspect-auto' src={mediaInfo.poster || undefined} 
            onError={e => {
              console.log('failed to load image for', mediaInfo.title)
              // e.currentTarget.src = '/someImage'
            }}
          />
          <div className='bg-secondary rounded-lg flex flex-col gap-4 items-center justify-center p-4 w-full'>
            <Link href={`${linkPrefix}/${mediaInfo.imdbId}`} className='text-center text-wrap hover:underline z-10'>{mediaInfo.title}</Link>
            <div className='flex flex-wrap whitespace-nowrap justify-between gap-4 w-full'>
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
      <div className='w-screen shrink-0'></div>
      <ConfirmModal visible={showDialog} setVisible={setShowDialog} action={() => {
        console.log('navigate to media page')
        router.push(`/media/${sorted[viewIndex].imdbId}`)
      }} key={viewIndex}>
        <div className='max-h-[75vh] overflow-auto'>
          {viewIndex > -1 ? <MediaInfo imdbId={sorted[viewIndex].imdbId}/> : undefined}
        </div>
      </ConfirmModal>
      <ScrollBar orientation='horizontal' />
    </CustomScrollArea>
  )

  return (
    // <div className='overflow-x-scroll flex gap-4 p-4 snap-x snap-mandatory'
    <CustomScrollArea className='flex gap-4 p-4 snap-x snap-mandatory'
      ref={containerRef}
    >
      <div className='flex gap-4 p-4 snap-x snap-mandatory'>
        {sorted.map((_, i) => {
          return <div className={`${i === 0 ? 'ml-[100vw]' : ''} flex justify-center items-center text-3xl snap-item w-64 h-64 bg-red-400 shrink-0 rounded-lg snap-center transition-transform duration-500 ${i === viewIndex ? '' : 'scale-50 opacity-50'}`}
            onClick={(e) => {
              if (i === viewIndex) {
                // setShowDialog(true);
              } else {
                if (!containerRef.current) return;
                scrollToCenter(e.currentTarget, containerRef.current);
              }
            }}
            data-index={i}
            key={i}
          >
            {i}
          </div>
        })}
      </div>
      <ScrollBar orientation='horizontal' />
    </CustomScrollArea>
  )
}

/*
<div className='flex gap-4 p-4 snap-x snap-mandatory'>
  {sorted.map((_, i) => {
    return <div className='w-64 h-64 bg-red-400 shrink-0 rounded-lg snap-center'>{i}</div>
  })}
</div>
 * */
