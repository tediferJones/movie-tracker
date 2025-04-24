import * as ScrollAreaPrimitive from '@radix-ui/react-scroll-area';
import { forwardRef } from 'react';

export default forwardRef<HTMLDivElement, React.ComponentPropsWithoutRef<typeof ScrollAreaPrimitive.Viewport>>(
  ({ children, ...props }, ref) => (
    <ScrollAreaPrimitive.Root className='w-full overflow-hidden' type='auto'>
      <ScrollAreaPrimitive.Viewport ref={ref} className='snap-x snap-mandatory w-full whitespace-nowrap'>
        <div {...props}>
          {children}
        </div>
      </ScrollAreaPrimitive.Viewport>
      <ScrollAreaPrimitive.Scrollbar orientation='horizontal' />
    </ScrollAreaPrimitive.Root>
  )
);
