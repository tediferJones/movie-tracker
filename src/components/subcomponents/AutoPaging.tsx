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
  // FIX ME
  // also consider making this component increment when scrolled to bottom of container
  // shouldn't necessarily need to be visible
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!ref.current) return;
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
  }, [ref.current]);

  return currentCount < maxCount && <Loading ref={ref} />
}
