import * as ScrollAreaPrimitive from '@radix-ui/react-scroll-area';
import { forwardRef } from 'react';
import { ScrollBar } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';

interface SnapScrollArea extends React.ComponentPropsWithoutRef<typeof ScrollAreaPrimitive.Viewport> {
  orientation: 'vertical' | 'horizontal',
  type?: ScrollAreaPrimitive.ScrollAreaProps['type'],
}

export default forwardRef<HTMLDivElement, SnapScrollArea>(
  ({ children, orientation, type, className, ...props }, ref) => (
    <ScrollAreaPrimitive.Root type={type} className='overflow-hidden'>
      <ScrollAreaPrimitive.Viewport className={cn('!flex h-full w-full snap-both scroll-smooth snap-mandatory', className)}
        asChild
        ref={ref}
        {...props}
      >
        {children}
      </ScrollAreaPrimitive.Viewport>
      <ScrollBar orientation={orientation} />
    </ScrollAreaPrimitive.Root>
  )
)
