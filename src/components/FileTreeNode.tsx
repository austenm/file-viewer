import { useState } from 'react';
import { useActivePath, useFileActions } from '../state/ActiveFileProvider';
import type { FileNode } from '../utils/types';
import FileIcon from './FileIcon';
import ChevronIcon from './ChevronIcon';
import { cn } from '../utils/cn';

type FileTreeNodeProps = {
  file: FileNode;
  depth?: number;
};

const FileTreeNode = ({ file, depth = 0 }: FileTreeNodeProps) => {
  const activePath = useActivePath();
  const { openFile } = useFileActions();
  const [isFolderExpanded, setIsFolderExpanded] = useState(true);
  const isFolder = Array.isArray(file.children) && file.children.length > 0;
  const isActive = activePath === file.path;

  return (
    <div>
      <div
        role="treeitem"
        aria-expanded={isFolder ? isFolderExpanded : undefined}
        aria-selected={isActive || undefined}
        onClick={() => {
          if (isFolder) setIsFolderExpanded((prevExpanded) => !prevExpanded);
          else openFile(file.path);
        }}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            if (isFolder) setIsFolderExpanded((prevExpanded) => !prevExpanded);
            else openFile(file.path);
          }
        }}
        tabIndex={0}
        className={cn(
          'flex w-full items-center gap-0.5 py-[1px] hover:cursor-pointer',
          isActive ? 'bg-neutral-600/50' : 'hover:bg-neutral-700/50',
        )}
        style={{ paddingLeft: `${depth / 2}rem` }}
        title={file.path}
      >
        {isFolder ? (
          <ChevronIcon
            expanded={isFolderExpanded}
            className="text-neutral-300"
          />
        ) : (
          <FileIcon fileName={file.path} />
        )}

        <span className="text-[0.82rem] font-light text-neutral-300">
          {file.name}
        </span>
      </div>
      {isFolder && isFolderExpanded && (
        <div role="group">
          {file.children!.map((child) => (
            <FileTreeNode key={child.path} file={child} depth={depth + 1} />
          ))}
        </div>
      )}
    </div>
  );
};

export default FileTreeNode;
