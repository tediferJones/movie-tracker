// import { ReactNode, isValidElement, Children, cloneElement, forwardRef, useRef } from 'react';
// import { ScrollArea } from '@/components/ui/scroll-area';
import * as ScrollAreaPrimitive from '@radix-ui/react-scroll-area';
import { ReactNode, forwardRef } from 'react';

interface SnapScrollArea extends React.ComponentPropsWithoutRef<typeof ScrollAreaPrimitive.Viewport> {
  orientation: 'vertical' | 'horizontal'
}

// SnapScrollArea.tsx
// import * as ScrollAreaPrimitive from "@radix-ui/react-scroll-area"
// import { cn } from "@/lib/utils" // Or just use className strings

export default forwardRef<HTMLDivElement, SnapScrollArea>(
  ({ children, orientation, ...props }, ref) => (
    <ScrollAreaPrimitive.Root>
      <ScrollAreaPrimitive.Viewport {...props}
        ref={ref}
      >
        {children}
      </ScrollAreaPrimitive.Viewport>
      {/*
      <ScrollAreaPrimitive.Scrollbar orientation={orientation} />
      */}
      <ScrollAreaPrimitive.Scrollbar orientation={orientation} className='bg-blue-500'>
        <ScrollAreaPrimitive.Thumb className="bg-gray-500 rounded-full" />
      </ScrollAreaPrimitive.Scrollbar>
    </ScrollAreaPrimitive.Root>
  )
)

// export function SnapScrollArea({ children }: { children: ReactNode[] }) {
//   return (
//     <ScrollAreaPrimitive.Root className="w-full h-[500px] overflow-hidden rounded-md border">
//       <ScrollAreaPrimitive.Viewport
//         className={cn(
//           "h-full w-full",
//           "snap-y snap-mandatory",
//           "overflow-y-scroll"
//         )}
//       >
//         {children}
//       </ScrollAreaPrimitive.Viewport>
//       <ScrollAreaPrimitive.Scrollbar
//         orientation="vertical"
//         className="bg-gray-200"
//       >
//         <ScrollAreaPrimitive.Thumb className="bg-gray-500 rounded-full" />
//       </ScrollAreaPrimitive.Scrollbar>
//     </ScrollAreaPrimitive.Root>
//   )
// }

// export default forwardRef<HTMLDivElement, SnapScrollArea>(
//   ({ children, orientation, ...props }, ref) => (
//     <ScrollAreaPrimitive.Root className='w-full overflow-hidden' type='auto'>
//       <ScrollAreaPrimitive.Viewport ref={ref} className='snap-x snap-mandatory w-full whitespace-nowrap'>
//         <div {...props}>
//           {children}
//         </div>
//       </ScrollAreaPrimitive.Viewport>
//       <ScrollAreaPrimitive.Scrollbar orientation={orientation} />
//     </ScrollAreaPrimitive.Root>
//   )
// );

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
