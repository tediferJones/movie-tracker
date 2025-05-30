import { forwardRef } from 'react';
import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

type LoadingProps = Partial<React.HTMLAttributes<HTMLDivElement>>

export default forwardRef<HTMLDivElement, LoadingProps>(
  ({ className, ...props }, ref) => (
    <div className={cn('flex justify-center items-center colorPrimary m-auto p-4 cursor-progress', className)}
      ref={ref}
      {...props}
    >
      <Loader2 className='mr-2 h-4 w-4 animate-spin' />
      <span>Please wait</span>
    </div>
  )
)

// export default function Loading() {
//   return (
//     <div className='flex justify-center items-center colorPrimary m-auto p-4'>
//       <Loader2 className='mr-2 h-4 w-4 animate-spin' id='amDiv' />Please wait
//     </div>
//   )
// }
