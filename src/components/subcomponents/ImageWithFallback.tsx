import { useState, useEffect, useRef } from 'react';
import Loading from '@/components/subcomponents/loading';

interface ImageWithFallbackProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  alt: string,
}

export default function ImageWithFallback({ src, alt, ...props }: ImageWithFallbackProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [retryCount, setRetryCount] = useState(0);
  const maxRetryCount = 5;

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        }
      },
      { threshold: 0.1 }
    );

    const imgTag = ref.current;
    if (imgTag) {
      observer.observe(imgTag);
      return () => observer.unobserve(imgTag);
    }
  }, [ref.current]);

  if (!src || hasError) {
    console.log('failed to load', alt, 'from', src)
    return (
      <div className='bg-secondary flex flex-col gap-4 justify-center items-center min-h-72 aspect-[2/3] rounded-lg max-w-full'>
        <span className='text-5xl font-extrabold'>404</span>
        <span className='text-wrap text-center'>Poster Not Found</span>
      </div>
    )
  }

  return (
    <div className='my-auto rounded-lg overflow-hidden'
      key={`${alt}-${isVisible}-${isLoaded}`}
      ref={ref}
    >
      {!isVisible ? <div>Not Visible</div> :
        <>
          {!isLoaded && <Loading />}
          <img 
            key={`${alt}-${retryCount}`}
            src={src}
            alt={alt}
            {...props}

            onLoad={() => setIsLoaded(true)}
            onError={() => {
              if (retryCount < maxRetryCount) {
                setRetryCount(retryCount + 1);
              } else {
                setHasError(true);
              }
            }}
            loading='lazy'
            decoding='async'
          />
        </>
      }
    </div>
  )
}
