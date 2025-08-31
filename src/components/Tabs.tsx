import React, {
  memo,
  forwardRef,
  useCallback,
  useRef,
  useState,
  useEffect,
} from 'react';
import { useFileState, useFileActions } from '../state/ActiveFileProvider';
import FileIcon from './FileIcon';
import CloseIcon from './CloseIcon';
import { cn } from '../utils/cn';
import { tabIdFromPath } from '../utils/ids';

const fileName = (p: string) => p.split('/').pop() || p;

type TabProps = {
  path: string;
  active: boolean;
  tabFocusPath: string | null;
  onSelect: (path: string) => void;
  onClose: (path: string) => void;
  setTabFocusPath: (path: string) => void;
};

const Tab = memo(
  forwardRef<HTMLButtonElement, TabProps>(function Tab(
    {
      path,
      active,
      tabFocusPath,
      onSelect,
      onClose,
      setTabFocusPath,
    }: TabProps,
    ref,
  ) {
    const handleSelect = useCallback(() => onSelect(path), [onSelect, path]);
    const handleClose = useCallback(
      (e: React.MouseEvent) => {
        e.stopPropagation();
        onClose(path);
      },
      [onClose, path],
    );

    return (
      <div
        role="presentation"
        className={cn(
          'group flex items-center gap-1.5 p-1.5 border-r border-[#2a2a2a] select-none',
          active
            ? 'bg-[#1e1e1e] text-neutral-300'
            : 'bg-[#252526] text-neutral-400',
        )}
      >
        <button
          ref={ref}
          type="button"
          id={tabIdFromPath(path)}
          role="tab"
          aria-selected={active}
          aria-controls="editor-panel"
          aria-label={path}
          aria-current={active ? 'page' : undefined}
          title={path}
          tabIndex={tabFocusPath === path ? 0 : -1}
          onFocus={() => setTabFocusPath(path)}
          onClick={handleSelect}
          className={cn(
            'flex items-center gap-1.5 -ml-0.5 pr-0.5',
            'hover:cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-neutral-500/60',
          )}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              onSelect(path);
            }
            if (
              e.key === 'Delete' ||
              ((e.ctrlKey || e.metaKey) && (e.key === 'w' || e.key === 'W'))
            ) {
              e.preventDefault();
              onClose(path);
            }
          }}
          onAuxClick={(e) => {
            if (e.button === 1) {
              e.preventDefault();
              onClose(path);
            }
          }}
        >
          <FileIcon fileName={path} />
          <span className="truncate max-w-[12rem] min-w-0 text-[0.82rem] -ml-0.5">
            {fileName(path)}
          </span>
        </button>
        <button
          type="button"
          tabIndex={-1}
          aria-label={`Close ${fileName(path)}`}
          className={cn(
            '-mr-0.5 p-1 rounded-md hover:bg-neutral-700 hover:text-neutral-300 hover:cursor-pointer',
            active ? 'text-neutral-900' : 'text-neutral-800',
            'group-hover:text-neutral-400',
          )}
          onClick={handleClose}
        >
          <CloseIcon size={14} />
        </button>
      </div>
    );
  }),
);

const Tabs = () => {
  const { openPaths, activePath } = useFileState();
  const { setActivePath, closeFile } = useFileActions();
  const [isHovering, setIsHovering] = useState(false);
  const tabRefs = useRef(new Map<string, HTMLButtonElement>());
  const [tabFocusPath, setTabFocusPath] = useState<string | null>(
    activePath ?? openPaths[0] ?? null,
  );

  const handleSelect = (path: string) => {
    setTabFocusPath(path);
    setActivePath(path);
  };

  const prefersReduced =
    typeof window !== 'undefined' &&
    window.matchMedia?.('(prefers-reduced-motion: reduce').matches;

  useEffect(() => {
    if (!activePath) return;
    const el = tabRefs.current.get(activePath);
    if (!el) return;

    requestAnimationFrame(() => {
      el.scrollIntoView?.({
        block: 'nearest',
        inline: 'nearest',
        behavior: prefersReduced ? 'auto' : 'smooth',
      });
    });
  }, [activePath, prefersReduced]);

  const focusNeighbor = (closed: string) => {
    const i = openPaths.indexOf(closed);
    const next = openPaths[i + 1] ?? openPaths[i - 1];
    if (next) {
      setTabFocusPath(next);
      requestAnimationFrame(() => tabRefs.current.get(next)?.focus());
    } else {
      setTabFocusPath(null);
    }
  };

  if (openPaths.length === 0) return null;

  return (
    <div
      role="tablist"
      aria-label="Open files"
      aria-orientation="horizontal"
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => setIsHovering(false)}
      className={cn(
        'scrollbar flex overflow-x-auto overflow-y-hidden bg-neutral-800 min-w-0 whitespace-nowrap',
        isHovering && 'scrollbar--hover',
      )}
      onWheel={(e) => {
        if (Math.abs(e.deltaY) > Math.abs(e.deltaX)) {
          e.currentTarget.scrollLeft += e.deltaY;
        }
      }}
      onKeyDown={(e) => {
        if (!openPaths.length) return;
        const current = document.activeElement as HTMLElement | null;
        let idx = Math.max(
          0,
          openPaths.findIndex((p) => tabRefs.current.get(p) === current),
        );
        const last = openPaths.length - 1;
        const focusAt = (i: number) =>
          (() => {
            const p = openPaths[i];
            if (!p) return;
            setTabFocusPath(p);
            tabRefs.current.get(p)?.focus();
          })();
        switch (e.key) {
          case 'ArrowRight':
          case 'ArrowDown':
            e.preventDefault();
            focusAt(idx === last ? 0 : idx + 1);
            break;
          case 'ArrowLeft':
          case 'ArrowUp':
            e.preventDefault();
            focusAt(idx === 0 ? last : idx - 1);
            break;
          case 'Home':
            e.preventDefault();
            focusAt(0);
            break;
          case 'End':
            e.preventDefault();
            focusAt(last);
            break;
        }
      }}
    >
      {openPaths.map((path) => (
        <Tab
          path={path}
          key={path}
          active={activePath === path}
          tabFocusPath={tabFocusPath}
          onSelect={handleSelect}
          onClose={(p) => {
            focusNeighbor(p);
            closeFile(p);
          }}
          setTabFocusPath={setTabFocusPath}
          ref={(el) => {
            if (el) tabRefs.current.set(path, el);
            else tabRefs.current.delete(path);
          }}
        />
      ))}
    </div>
  );
};

export { Tab };
export default Tabs;
