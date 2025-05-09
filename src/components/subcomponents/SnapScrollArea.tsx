// import { ReactNode, isValidElement, Children, cloneElement, forwardRef, useRef } from 'react';
// import { ScrollArea } from '@/components/ui/scroll-area';
import * as ScrollAreaPrimitive from '@radix-ui/react-scroll-area';
import { forwardRef } from 'react';

interface SnapScrollArea extends React.ComponentPropsWithoutRef<typeof ScrollAreaPrimitive.Viewport> {
  orientation: 'vertical' | 'horizontal'
}

export default forwardRef<HTMLDivElement, SnapScrollArea>(
  ({ children, orientation, ...props }, ref) => (
    <ScrollAreaPrimitive.Root className='w-full overflow-hidden' type='auto'>
      <ScrollAreaPrimitive.Viewport ref={ref} className='snap-x snap-mandatory w-full whitespace-nowrap'>
        <div {...props}>
          {children}
        </div>
      </ScrollAreaPrimitive.Viewport>
      <ScrollAreaPrimitive.Scrollbar orientation={orientation} />
    </ScrollAreaPrimitive.Root>
  )
);

// const GenericSnapScrollArea = forwardRef<HTMLDivElement, SnapScrollArea>(
//   ({ children, orientation, ...props }, ref) => (
//     <ScrollAreaPrimitive.Root className='overflow-hidden' type='always'>
//       <ScrollAreaPrimitive.Viewport ref={ref} className='h-full'>
//         <div {...props}>
//           {children}
//         </div>
//       </ScrollAreaPrimitive.Viewport>
//       <ScrollAreaPrimitive.Scrollbar orientation={orientation} />
//     </ScrollAreaPrimitive.Root>
//   )
// );
// 
// export default function ScrollAreaVerticalSnap({ children }: { children: ReactNode[] }) {
//   const ref = useRef<HTMLDivElement>(null);
//   return (
//     <GenericSnapScrollArea orientation='vertical' ref={ref}>
//       {Array(50).fill(0).map((_, i) => <div className='text-center text-2xl'>{i}</div>)}
//       {/*
//       {children}
//       */}
//     </GenericSnapScrollArea>
//   )
// }
