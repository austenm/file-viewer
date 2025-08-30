import { useFileActions, useFileState } from '../state/ActiveFileProvider';
import type { FileNode } from '../utils/types';
import FileIcon from './FileIcon';
import ChevronIcon from './ChevronIcon';
import { cn } from '../utils/cn';

type FileTreeNodeProps = {
  file: FileNode;
  depth?: number;
  expandedPaths: Set<string>;
  registerForPath: (path: string) => (el: HTMLDivElement | null) => void;
};

const FileTreeNode = ({
  file,
  depth = 0,
  expandedPaths,
  registerForPath,
}: FileTreeNodeProps) => {
  const { activePath, treeFocusPath } = useFileState();
  const { openFile, setTreeFocusPath, toggleExpanded } = useFileActions();

  const isFolder = Array.isArray(file.children);
  const isActive = activePath === file.path;
  const isFocused = treeFocusPath === file.path;

  return (
    <div>
      <div
        ref={registerForPath(file.path)}
        role="treeitem"
        tabIndex={isFocused ? 0 : -1}
        aria-expanded={isFolder ? expandedPaths.has(file.path) : undefined}
        aria-selected={isActive || undefined}
        aria-level={depth + 1}
        aria-current={isActive ? 'page' : undefined}
        aria-label={file.path}
        onClick={() => {
          setTreeFocusPath(file.path);
          if (isFolder) {
            toggleExpanded(file.path);
          } else {
            openFile(file.path);
          }
        }}
        className={cn(
          'flex w-full items-center gap-0.5 py-[1px] hover:cursor-pointer',
          isActive ? 'bg-neutral-600/50' : 'hover:bg-neutral-700/50',
        )}
        style={{ paddingLeft: `${depth / 2}rem` }}
        title={file.path}
      >
        {isFolder ? (
          <ChevronIcon
            expanded={expandedPaths.has(file.path)}
            className="text-neutral-300"
          />
        ) : (
          <FileIcon fileName={file.path} />
        )}

        <span className="text-[0.82rem] font-light text-neutral-300">
          {file.name}
        </span>
      </div>
      {isFolder && expandedPaths.has(file.path) && (
        <div role="group">
          {file.children!.map((child) => (
            <FileTreeNode
              key={child.path}
              file={child}
              depth={depth + 1}
              expandedPaths={expandedPaths}
              registerForPath={registerForPath}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default FileTreeNode;
