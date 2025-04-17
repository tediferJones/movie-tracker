import { ReactNode } from 'react';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';

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
