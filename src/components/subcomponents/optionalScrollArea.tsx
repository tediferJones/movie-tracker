import { ReactNode } from 'react';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';

// FIX ME
// you can probably just delete this component
export default function OptionalScrollArea(
  {
    scrollEnabled,
    orientation,
    className,
    children,
  }: {
    scrollEnabled?: boolean,
    orientation: 'horizontal' | 'vertical',
    className?: string,
    children: ReactNode
  }
) {
  return !scrollEnabled ? <>{children}</> :
    <ScrollArea type='auto'>
      <div className={`${className}`}>{children}</div>
      <ScrollBar orientation={orientation} />
    </ScrollArea>
}
