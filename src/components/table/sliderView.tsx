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
  // const [viewIndex, setViewIndex] = useState(0);
  const [showDialog, setShowDialog] = useState(false);
  // const ref = useRef<HTMLDivElement>(null);

  // useEffect(() => {
  //   if (!ref.current) return console.log('no ref.current')
  //   const observer = new IntersectionObserver((entries) => {
  //     // console.log('what is entries', entries)
  //     // working with w-1/2 on container
  //     // console.log('observing', entries)
  //     // const visibileEntry = entries.reduce((max, entry) => {
  //     //   return entry.intersectionRatio > max.intersectionRatio ? entry : max;
  //     // }, entries[0])

  //     // if (visibileEntry) {
  //     //   console.log('visible entry', visibileEntry)
  //     //   setViewIndex(Number((visibileEntry.target as HTMLElement).dataset.index))
  //     // }

  //     // console.log(entries.filter(entry => entry.isIntersecting))

  //     // console.log('all entries', entries.length)
  //     // console.log('isIntersecting', entries.filter(entries => entries.isIntersecting).length)
  //     // entries.some(entry => {
  //     //   if (entry.isIntersecting) {
  //     //     setViewIndex(Number((entry.target as HTMLElement).dataset.index))
  //     //   }
  //     // })

  //     // const visible = entries.filter(entry => entry.isIntersecting)
  //     // console.log(visible)
  //     // if (visible.length) {
  //     //   const i = (visible[Math.floor(visible.length / 2)].target as HTMLDivElement).dataset.index
  //     //   setViewIndex(Number(i))
  //     // }

  //     // const fullyVisible = entries.reduce((arr, entry) => {
  //     //   if (entry.intersectionRatio >= 0.75) {
  //     //     return arr.concat(entry)
  //     //   }
  //     //   return arr
  //     // }, [] as IntersectionObserverEntry[])
  //     // console.log({ fullyVisible })

  //     // console.log('length', entries.length)
  //     // console.log(entries)
  //   }, {
  //       root: ref.current,
  //       threshold: 1,
  //     })

  //   const items = ref.current.querySelectorAll('.snap-item');
  //   items.forEach((item) => observer.observe(item));

  //   return () => {
  //     items.forEach((item) => observer.unobserve(item));
  //   };
  // }, [])

  const { containerRef, centeredElement } = useCenteredItem<HTMLDivElement>();
  console.log(centeredElement?.dataset.index);
  const viewIndex = Number(centeredElement?.dataset.index);
  const router = useRouter();

  const scrollToCenter = (item: HTMLElement, container: HTMLElement) => {
    // const itemRect = item.getBoundingClientRect();
    // const containerRect = container.getBoundingClientRect();

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
