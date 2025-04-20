import { useEffect, useRef, useState } from 'react';

export default function useCenteredItem<T extends HTMLElement = HTMLElement>() {
  const containerRef = useRef<T>(null);
  const [centeredElement, setCenteredElement] = useState<HTMLElement | null>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const getCenteredElement = () => {
      const items = container.querySelectorAll<HTMLElement>('.snap-item');
      const containerRect = container.getBoundingClientRect();
      const containerCenterX = containerRect.left + containerRect.width / 2;

      let closest: HTMLElement | null = null;
      let closestDistance = Infinity;

      items.forEach(item => {
        const rect = item.getBoundingClientRect();
        const itemCenterX = rect.left + rect.width / 2;
        const distance = Math.abs(itemCenterX - containerCenterX);

        if (distance < closestDistance) {
          closest = item;
          closestDistance = distance;
        }
      });

      setCenteredElement(closest);
    };

    const handleScroll = () => {
      getCenteredElement();
      clearTimeout((handleScroll as any)._timeout);
      (handleScroll as any)._timeout = setTimeout(getCenteredElement, 100);
    };

    container.addEventListener('scroll', handleScroll);
    window.addEventListener('resize', getCenteredElement);

    getCenteredElement();

    return () => {
      container.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', getCenteredElement);
    };
  }, []);

  return { containerRef, centeredElement };
}
