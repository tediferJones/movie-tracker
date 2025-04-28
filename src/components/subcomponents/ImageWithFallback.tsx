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
    )

    const imgTag = ref.current;
    if (imgTag) {
      console.log('adding observer for', alt)
      observer.observe(imgTag);
      return () => {
        console.log('removing observer for', alt)
        observer.unobserve(imgTag);
      }
    }
  }, [ref.current]);

  if (!src || hasError) {
    console.log('failed to load', alt, 'from', src)
    return (
      <div className='bg-secondary flex flex-col gap-4 justify-center items-center w-full h-1/2'>
        <span className='text-5xl font-extrabold'>404</span>
        <span className='text-wrap text-center'>Poster Not Found</span>
      </div>
    )
  }

  return (
    <div key={`${alt}-${isVisible}-${isLoaded}`} ref={ref} className='my-auto'>
      {!isVisible ? <div>Not Visible</div> :
        <>
          {!isLoaded && <Loading />}
          <img 
            key={`${alt}-${retryCount}`}
            src={src}
            alt={alt}
            {...props}

            onLoad={() => {
              console.log('onLoad event')
              setIsLoaded(true)
            }}
            // onError={() => setHasError(true)}
            onError={() => {
              if (retryCount < maxRetryCount) {
                console.log('retry', retryCount, 'for', alt)
                setRetryCount(retryCount + 1)
              } else {
                setHasError(true)
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

// export default function ImageWithFallback({ src, alt, ...props }: { src?: string, alt: string }) {
//   const [hasError, setHasError] = useState(false);
//   const [retryCount, setRetryCount] = useState(0);
//   // const [loaded, setLoaded] = useState(false);
//   // const imgRef = useRef<HTMLImageElement>(null);
// 
//   // useEffect(() => {
//   //   const img = imgRef.current;
//   //   if (img && img.complete && img.naturalHeight !== 0) {
//   //     setLoaded(true);
//   //   }
//   // }, [src, imgRef.current]);
// 
//   if (!src || hasError) {
//     console.log(`failed to load`, alt)
//     return <div className='bg-secondary flex flex-col gap-4 justify-center items-center w-full h-1/2'>
//       <span className='text-5xl font-extrabold'>404</span>
//       <span className='text-wrap text-center'>Poster Not Found</span>
//     </div>
//   }
// 
//   return <img src={src}
//     alt={alt}
//     // onError={() => setHasError(true)}
//     onError={() => {
//       if (retryCount < 5) {
//         setRetryCount(retryCount + 1)
//       } else {
//         setHasError(true)
//       }
//     }}
//     {...props}
//     key={`${src}-${retryCount}`}
// 
//     // loading='lazy'
// 
//     // ref={imgRef}
//     // onLoad={() => setLoaded(true)}
//     // decoding='async'
//   />
// }
