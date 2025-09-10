import { useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';

const ContextMenu = ({
  state,
  onClose,
  onAction,
}: {
  state: {
    open: true;
    x: number;
    y: number;
    path: string;
    kind: 'file' | 'dir';
  };
  onClose: () => void;
  onAction: (a: 'new-file' | 'new-folder' | 'rename' | 'delete') => void;
}) => {
  const menuRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const onDocClick = (e: MouseEvent) => {
      const el = menuRef.current;
      if (el && !el.contains(e.target as Node)) onClose();
    };
    document.addEventListener('click', onDocClick);
    return () => document.removeEventListener('click', onDocClick);
  }, [onClose]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [onClose]);

  if (!state) return null;

  const buttonStyle =
    'w-full px-3 py-1.5 text-left hover:bg-neutral-700 text-neutral-300';

  return createPortal(
    <div
      ref={menuRef}
      role="menu"
      tabIndex={-1}
      className="fixed z-50 min-w-[180px] rounded-md border border-neutral-700 bg-neutral-800 shadow-xl py-1 text-sm"
      style={{ left: state.x, top: state.y }}
      onContextMenu={(e) => {
        e.preventDefault();
        e.stopPropagation();
      }}
    >
      <button
        role="menuitem"
        className={buttonStyle}
        onClick={() => {
          onAction('new-file');
          onClose();
        }}
      >
        New File
      </button>
      <button
        role="menuitem"
        className={buttonStyle}
        onClick={() => {
          onAction('new-folder');
          onClose();
        }}
      >
        New Folder
      </button>
      <div className="my-1 h-px bg-neutral-700" />
      <button
        role="menuitem"
        className={buttonStyle}
        onClick={() => {
          onAction('rename');
          onClose();
        }}
      >
        Rename
      </button>
      <button
        role="menuitem"
        className={buttonStyle}
        onClick={() => {
          onAction('delete');
          onClose();
        }}
      >
        Delete
      </button>
    </div>,
    document.body,
  );
};

export default ContextMenu;
