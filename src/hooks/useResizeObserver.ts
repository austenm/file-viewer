import { useEffect } from 'react';

export const useResizeObserver = (
  el: HTMLElement | null,
  onSize: (entry: ResizeObserverEntry) => void,
) => {
  useEffect(() => {
    if (!el) return;
    const resizeObserver = new ResizeObserver((entries) => {
      for (const e of entries) onSize(e);
    });
    resizeObserver.observe(el);
    return () => resizeObserver.disconnect();
  }, [el, onSize]);
};
