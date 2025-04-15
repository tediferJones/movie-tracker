import { useEffect, useRef, useState } from 'react';

// export default function useOverflowDetector<T extends HTMLElement = HTMLElement>() {
//   const ref = useRef<T>(null);
//   const [isOverflowing, setIsOverflowing] = useState(false);
// 
//   // useEffect(() => {
//   //   console.log('ref from useOverflowDetector', ref)
//   //   const element = ref.current;
//   //   if (!element) return;
// 
//   //   const checkOverflow = () => {
//   //     console.log('checking size', element.scrollWidth, element.clientWidth);
//   //     setIsOverflowing(
//   //       element.scrollWidth > element.clientWidth
//   //     );
//   //   }
// 
//   //   checkOverflow();
// 
//   //   const resizeObserver = new ResizeObserver(checkOverflow);
//   //   resizeObserver.observe(element);
// 
//   //   return () => resizeObserver.disconnect();
//   // }, [ref.current]);
// 
//   useEffect(() => {
//     const observer = new ResizeObserver((entries) => {
//       const el = entries[0].target as T;
//       const hasOverflow = el.scrollWidth > el.clientWidth;
//       console.log('ResizeObserver triggered:', {
//         scrollWidth: el.scrollWidth,
//         clientWidth: el.clientWidth,
//         hasOverflow
//       });
//       setIsOverflowing(hasOverflow);
//     });
// 
//     if (ref.current) {
//       observer.observe(ref.current);
//     }
// 
//     return () => observer.disconnect();
//   }, []);
// 
//   return { ref, isOverflowing }
// }

// OverflowTest.tsx
// import { useEffect, useRef, useState } from 'react';

export default function useOverflowDetector<T extends HTMLElement = HTMLElement>() {
  const ref = useRef<T>(null);
  const [isOverflowing, setIsOverflowing] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) {
      console.warn("ref.current is null");
      return;
    }

    const checkOverflow = () => {
      const isOver =
        el.scrollWidth > el.clientWidth || el.scrollHeight > el.clientHeight;

      console.log("Checking overflow:", {
        scrollWidth: el.scrollWidth,
        clientWidth: el.clientWidth,
        scrollHeight: el.scrollHeight,
        clientHeight: el.clientHeight,
        isOver,
      });

      setIsOverflowing(isOver);
    };

    checkOverflow(); // Initial check

    const resizeObserver = new ResizeObserver(checkOverflow);
    resizeObserver.observe(el);

    const mutationObserver = new MutationObserver(checkOverflow);
    mutationObserver.observe(el, {
      childList: true,
      subtree: true,
      characterData: true,
    });

    window.addEventListener("resize", checkOverflow);

    return () => {
      resizeObserver.disconnect();
      mutationObserver.disconnect();
      window.removeEventListener("resize", checkOverflow);
    };
  }, []);

  return { ref, isOverflowing };
}

// export default function OverflowTest() {
//   const { ref, isOverflowing } = useOverflowDetector<HTMLDivElement>();
// 
//   return (
//     <div style={{ padding: '2rem' }}>
//       <div
//         ref={ref}
//         style={{
//           whiteSpace: 'nowrap',
//           overflow: 'hidden',
//           border: '1px solid black',
//         }}
//       >
//         This is a very long bit of text that should overflow this box.
//       </div>
//       <p style={{ marginTop: '1rem' }}>
//         {isOverflowing ? "⚠️ Overflowing!" : "✅ Not overflowing"}
//       </p>
//     </div>
//   );
// }

