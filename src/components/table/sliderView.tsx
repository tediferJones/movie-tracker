import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import ConfirmModal from '@/components/subcomponents/confirmModal';
import MediaInfo from '@/components/pages/mediaPage/mediaInfo';
import ScrollAreaHorizontalSnap from '@/components/subcomponents/ScrollAreaHorizontalSnap';
import ImageWithFallback from '@/components/subcomponents/ImageWithFallback';
import useCenteredItem from '@/hooks/useCenteredItem';
import { getKeyFormatter } from '@/lib/formatters';
import { ExistingMediaInfo } from '@/types';

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
  const [viewIndex, setViewIndex] = useState(0);

  const { containerRef, centeredElement } = useCenteredItem<HTMLDivElement>();
  // console.log({ centeredElement })
  // let viewIndex = Number(centeredElement?.dataset.index);
  const router = useRouter();

  useEffect(() => {
    console.log('centered element has changed')
    setViewIndex(Number(centeredElement?.dataset.index));
  }, [centeredElement?.dataset.index]);

  useEffect(() => {
    console.log('sorted has changed')
    setViewIndex(0);
    const firstItem = document.querySelector<HTMLDivElement>(`[data-index='${0}']`);
    if (!firstItem || !containerRef.current) return;
    scrollToCenter(firstItem, containerRef.current);
  }, [sorted]);

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
    <ScrollAreaHorizontalSnap className='flex gap-4 p-4 snap-x snap-mandatory'
      ref={containerRef}
    >
      <div className='w-screen shrink-0'></div>
      {sorted.map((mediaInfo, i) => {
        return <div className={`sm:max-w-max max-w-36 max-h-[90vh] snap-item flex-shrink-0 flex flex-col items-center justify-center gap-4 snap-center cursor-pointer transition-transform duration-500 ${i === viewIndex ? '' : 'scale-50 opacity-50'}`}
          onClick={(e) => {
            if (i === viewIndex) {
              setShowDialog(true);
            } else {
              if (!containerRef.current) return;
              scrollToCenter(e.currentTarget, containerRef.current);

              // autoScroll to item
              // const clickedIndex = Number(e.currentTarget.dataset.index);
              // console.log(viewIndex, clickedIndex);
              // autoScroll(viewIndex, clickedIndex, 500);
            }
          }}
          data-index={i}
          key={i}
        >
          {/*
          // pick a 'sortBy' column, toggle sort direction a couple times and then go back to default order,
          // some images won't reload, and that needs fixed
          */}
          <ImageWithFallback src={mediaInfo.poster || undefined} alt={`Poster for ${mediaInfo.title}`} />
          {/*
          <img className='aspect-auto' src={mediaInfo.poster || undefined} 
            key={mediaInfo.poster}
            onError={e => {
              // console.log('failed to load image for', mediaInfo.title)
              // e.currentTarget.src = '/someImage'
              // e.currentTarget.outerHTML = <div></div>
            }}
          />
          */}
          <div className='bg-secondary rounded-lg flex flex-col gap-4 items-center justify-center p-4 w-full'>
            <Link className='text-center text-wrap hover:underline z-10'
              href={`${linkPrefix}/${mediaInfo.imdbId}`}
              onClick={(e) => e.stopPropagation()}
            >{mediaInfo.title}</Link>
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
      <ConfirmModal visible={showDialog} setVisible={setShowDialog}
        action={() => {
          console.log('navigate to media page')
          router.push(`/media/${sorted[viewIndex].imdbId}`)
        }}
        key={viewIndex}
        acceptText='Go To Media Page'
      >
        <ScrollArea type='auto' className='flex flex-col gap-4 text-wrap'
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
          }}
        >
          <div className='mr-6 flex flex-col gap-4'>
            {sorted[viewIndex]?.imdbId ? <MediaInfo imdbId={sorted[viewIndex].imdbId}/> : undefined}
          </div>
        </ScrollArea>
      </ConfirmModal>
      <ScrollBar orientation='horizontal' />
    </ScrollAreaHorizontalSnap>
  )
}

/*
<div className='flex gap-4 p-4 snap-x snap-mandatory'>
  {sorted.map((_, i) => {
    return <div className='w-64 h-64 bg-red-400 shrink-0 rounded-lg snap-center'>{i}</div>
  })}
</div>
 * */
