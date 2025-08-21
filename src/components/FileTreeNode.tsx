import { useState } from 'react';
import { useActivePath, useFileActions } from '../state/ActiveFileProvider';
import type { FileNode } from '../lib/buildTree';
import { FileIcon } from './FileIcon';
import ChevronIcon from './ChevronIcon';

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
      <button
        type="button"
        onClick={() => {
          isFolder
            ? setIsFolderExpanded((prevExpanded) => !prevExpanded)
            : openFile(file.path);
        }}
        className={`flex w-full items-center gap-0.5 py-[1px] hover:cursor-pointer ${isActive ? 'bg-neutral-600/50' : 'hover:bg-neutral-700/50'}`}
        style={{ paddingLeft: `${depth / 2}rem` }}
        aria-expanded={isFolder ? isFolderExpanded : undefined}
        aria-controls={isFolder ? file.path : undefined}
      >
        {isFolder ? (
          <ChevronIcon open={isFolderExpanded} className="text-neutral-300" />
        ) : (
          <FileIcon fileName={file.path} />
        )}

        <span className="text-[0.82rem] font-light text-neutral-300">
          {file.name}
        </span>
      </button>

      {isFolder &&
        isFolderExpanded &&
        file.children!.map((child) => (
          <FileTreeNode key={child.path} file={child} depth={depth + 1} />
        ))}
    </div>
  );
};

export default FileTreeNode;
