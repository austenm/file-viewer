import React, { memo, useCallback } from 'react';
import { useFileState, useFileActions } from '../state/ActiveFileProvider';
import FileIcon from './FileIcon';
import CloseIcon from './CloseIcon';

const fileName = (p: string) => p.split('/').pop() || p;

type TabProps = {
  path: string;
  active: boolean;
  onSelect: (path: string) => void;
  onClose: (path: string) => void;
};

const Tab = memo(({ path, active, onSelect, onClose }: TabProps) => {
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
      role="tab"
      aria-selected={active}
      title={path}
      tabIndex={active ? 0 : -1}
      onClick={handleSelect}
      className={[
        'group flex items-center gap-1.5 p-1.5 border-r border-neutral-600',
        active
          ? 'bg-neutral-900 text-neutral-100'
          : 'bg-neutral-800 text-neutral-300',
        'hover:cursor-pointer  focus:outline-none focus-visible:ring-2 focus-visible:ring-neutral-500/60',
      ].join(' ')}
      onKeyDown={(e) => {
        if (e.key === 'enter' || e.key === ' ') {
          e.preventDefault();
          onSelect(path);
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
      <span className="truncate max-w-[14rem] min-w-0 text-[0.82rem] -ml-0.5">
        {fileName(path)}
      </span>

      <button
        aria-label={`Close ${fileName(path)}`}
        className={[
          '-mr-0.5 p-1 rounded-md',
          'hover:bg-neutral-700 hover:text-neutral-100 hover:cursor-pointer',
          active ? 'text-neutral-900' : 'text-neutral-800',
          'group-hover:text-neutral-300',
        ].join(' ')}
        onClick={handleClose}
      >
        <CloseIcon size={14} />
      </button>
    </div>
  );
});

const Tabs = () => {
  const { openPaths, activePath } = useFileState();
  const { setActivePath, closeFile } = useFileActions();

  if (openPaths.length === 0) return null;

  return (
    <div
      role="tablist"
      className="scrollbar scrollbar-div flex overflow-auto bg-neutral-900 min-w-0 whitespace-nowrap"
      onWheel={(e) => {
        if (Math.abs(e.deltaY) > Math.abs(e.deltaX)) {
          e.currentTarget.scrollLeft += e.deltaY;
        }
      }}
    >
      {openPaths.map((path) => (
        <Tab
          path={path}
          key={path}
          active={activePath === path}
          onSelect={setActivePath}
          onClose={closeFile}
        />
      ))}
    </div>
  );
};

export default Tabs;
