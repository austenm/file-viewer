import { useEffect, useCallback } from 'react';

const useSaveShortcut = (enabled: boolean, onSave: () => void) => {
  const handler = useCallback(
    (e: KeyboardEvent) => {
      const isSaveCombo =
        (e.metaKey || e.ctrlKey) &&
        (e.code === 'KeyS' || e.key.toLowerCase() === 's');
      if (!isSaveCombo) return;

      e.preventDefault();
      if (e.repeat) {
        return;
      }
      1;
      const el = document.activeElement as HTMLElement | null;
      const isInMonaco = !!el?.closest?.('.monaco-editor, .monaco-diff-editor');
      const isNativeTextField =
        !!el &&
        (el.tagName === 'INPUT' ||
          el.tagName === 'TEXTAREA' ||
          el.isContentEditable ||
          el.getAttribute('role') === 'textbox');

      if (isNativeTextField && !isInMonaco) {
        return;
      }

      onSave();
    },
    [onSave],
  );

  useEffect(() => {
    if (typeof window === 'undefined' || !enabled) return;
    window.addEventListener('keydown', handler, { capture: true });

    return () => {
      window.removeEventListener('keydown', handler, { capture: true });
    };
  }, [enabled, handler]);
};

export default useSaveShortcut;
