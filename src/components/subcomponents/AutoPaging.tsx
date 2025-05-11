import { Dispatch, SetStateAction, useEffect, useRef } from 'react';
import Loading from '@/components/subcomponents/loading';

export default function usePaging(
  {
    page,
    setPage
  }: {
    page: number,
    setPage: Dispatch<SetStateAction<number>>
  }
) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    console.log('running useEffect hook for paging')
    if (!ref.current) throw Error('cant find ref');
    const observer = new IntersectionObserver(
      ([ entry ]) => {
        if (entry.isIntersecting) {
          console.log('seen, incrementing page')
          setPage(prev => prev + 1)
        }
      },
      { threshold: 0.1 }
    );
    observer.observe(ref.current);
    return () => observer.disconnect();
  }, [page])

  return <div ref={ref}><Loading /></div>
}
