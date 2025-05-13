import { Dispatch, SetStateAction, useEffect, useRef } from 'react';
import Loading from '@/components/subcomponents/loading';

export default function AutoPaging(
  {
    setPage, // adding 'use client' causes this to throw warning, fix that
    currentCount,
    maxCount,
  }: {
    setPage: Dispatch<SetStateAction<number>>
    currentCount: number,
    maxCount: number,
  }
) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!ref.current) throw Error('cant find ref');
    const observer = new IntersectionObserver(
      ([ entry ]) => {
        if (entry.isIntersecting) {
          setPage(prev => prev + 1);
        }
      },
      { threshold: 0.1 }
    );
    observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);

  return currentCount < maxCount && <div ref={ref}><Loading /></div>
}
