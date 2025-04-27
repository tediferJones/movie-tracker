// import { useState, useEffect, useRef } from 'react';
import { useState } from 'react';

export default function ImageWithFallback({ src, alt, ...props }: { src?: string, alt: string }) {
  const [hasError, setHasError] = useState(false);
  const [retryCount, setRetryCount] = useState(0);
  // const [loaded, setLoaded] = useState(false);
  // const imgRef = useRef<HTMLImageElement>(null);

  // useEffect(() => {
  //   const img = imgRef.current;
  //   if (img && img.complete && img.naturalHeight !== 0) {
  //     setLoaded(true);
  //   }
  // }, [src, imgRef.current]);

  if (!src || hasError) {
    console.log(`failed to load`, alt)
    return <div className='bg-secondary flex flex-col gap-4 justify-center items-center w-full h-1/2'>
      <span className='text-5xl font-extrabold'>404</span>
      <span className='text-wrap text-center'>Poster Not Found</span>
    </div>
  }

  return <img src={src}
    alt={alt}
    // onError={() => setHasError(true)}
    onError={() => {
      if (retryCount < 5) {
        setRetryCount(retryCount + 1)
      } else {
        setHasError(true)
      }
    }}
    {...props}
    key={`${src}-${retryCount}`}

    // loading='lazy'

    // ref={imgRef}
    // onLoad={() => setLoaded(true)}
    // decoding='async'
  />
}
