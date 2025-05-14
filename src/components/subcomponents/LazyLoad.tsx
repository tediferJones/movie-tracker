import { ReactNode, useEffect, useRef, useState, Suspense } from 'react';
import Loading from '@/components/subcomponents/loading';

export default function LazyLoad({ children }: { children: ReactNode }) {
  const ref = useRef(null);
  const [display, setDisplay] = useState(false);

  useEffect(() => {
    if (!ref.current) throw Error('cant find ref');
    const observer = new IntersectionObserver(
      ([ entry ]) => {
        console.log(entry.intersectionRatio)
        if (entry.isIntersecting) {
          // console.log('display the shiz')
          setDisplay(true);
          // setTimeout(() => {
          //   console.log(entry.intersectionRatio)
          //   console.log(children?.toString())
          //   setDisplay(true);
          // }, 1000)
        }
      },
      { threshold: 1 }
    );
    observer.observe(ref.current);
    return () => observer.disconnect();
  }, [])

  return display ? children : <div ref={ref}><Loading /></div>
  // return <div ref={ref}>{display ? <Suspense fallback={<Loading />}>{children}</Suspense> : <Loading />}</div>
}
