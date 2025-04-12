import { ReactNode } from "react";
import { ScrollArea } from "../ui/scroll-area";

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
      <div className={`bg-gradient-to-t ${className}`}>{children}</div>
    </ScrollArea>
}
