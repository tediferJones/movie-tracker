import { ReactNode } from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';

export default function OptionalScrollArea(
  {
    scrollEnabled,
    className,
    children,
  }: {
    scrollEnabled?: boolean,
    className?: string,
    children: ReactNode
  }
) {
  return !scrollEnabled ? <>{children}</> :
    <ScrollArea type='auto'>
      <div className={`${className}`}>{children}</div>
    </ScrollArea>
}
