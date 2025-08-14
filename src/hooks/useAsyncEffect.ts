import { useEffect } from 'react';

export default function useAsyncEffect(
  func: () => Promise<void> | Promise<() => void>,
  deps: React.DependencyList
) {
  return useEffect(() => {
    let cleanUpFunc: void | (() => void);
    func().then(cleanUp => cleanUpFunc = cleanUp);
    return () => cleanUpFunc?.();
  }, deps);
}
