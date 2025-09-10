import { useFileActions, useFileState } from '../state/ActiveFileProvider';
import type { FileNode } from '../utils/types';
import FileIcon from './FileIcon';
import ChevronIcon from './ChevronIcon';
import { cn } from '../utils/cn';
import { useEffect, useRef, useState } from 'react';

type FileTreeNodeProps = {
  file: FileNode;
  depth?: number;
  expandedPaths: Set<string>;
  registerForPath: (path: string) => (el: HTMLDivElement | null) => void;
};
const CreateFileNode = ({
  onBlur,
  depth = 0,
}: {
  onBlur: () => void;
  depth?: number;
}) => {
  const { newDraft } = useFileState();
  const { setNewFileName, cancelNewFile, confirmNewFile } = useFileActions();
  const [fileName, setFileName] = useState('');
  const inputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (inputRef.current == null) return;
    inputRef.current.focus();
  }, []);

  useEffect(() => {
    setNewFileName(fileName);
  }, [fileName]);

  return (
    <div className="flex flex-col">
      <div
        className="flex items-center gap-0.5"
        style={{ paddingLeft: `${depth / 1.5}rem` }}
      >
        <div className="min-w-4">
          <FileIcon
            fileName={fileName.includes('.') ? fileName : `${fileName}.txt`}
          />
        </div>
        <input
          onChange={(e) => setFileName(e.target.value)}
          onBlur={onBlur}
          ref={inputRef}
          onKeyDown={(e) => {
            switch (e.key) {
              case 'ArrowDown':
              case 'ArrowUp':
              case 'Home':
              case 'End':
                e.preventDefault();
                break;
              case 'Escape':
                e.preventDefault();
                cancelNewFile();
                break;
              case 'Enter':
                e.preventDefault();
                confirmNewFile();
                break;
            }
          }}
          className="bg-neutral-700 outline outline-blue-300 mt-1 py-0.5 text-neutral-200 text-xs indent-1"
        />
      </div>
      {newDraft!.error && (
        <div
          id="newfile-error"
          className="mt-1 text-xs text-red-400"
          style={{ paddingLeft: `${depth}rem` }}
        >
          {newDraft!.error}
        </div>
      )}
    </div>
  );
};

};

const FileTreeNode = ({
  file,
  depth = 0,
  expandedPaths,
  registerForPath,
}: FileTreeNodeProps) => {
  const { activePath, treeFocusPath, newDraft, renameDraft, newFolderDraft } =
    useFileState();
  const {
    openFile,
    setTreeFocusPath,
    toggleExpanded,
    cancelNewFile,
    setRenameName,
    confirmRename,
    cancelRename,
  } = useFileActions();
  const [showCreateFileNode, setShowCreateFileNode] = useState(true);

  const handleOnBlur = () => {
    setShowCreateFileNode(false);
    cancelNewFile();
    const fileTimer = setTimeout(() => {
      setShowCreateFileNode(true);
    }, 100);
    return () => {
      clearTimeout(fileTimer);
    };
  };


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
          isFocused && 'outline-2 outline-neutral-500/60',
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
        {renameDraft?.path === file.path ? (
          <input
            autoFocus
            value={renameDraft.name}
            onChange={(e) => setRenameName(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                confirmRename();
              } else if (e.key === 'Escape') {
                e.preventDefault();
                cancelRename();
              } else if (
                [
                  'ArrowUp',
                  'ArrowDown',
                  'ArrowLeft',
                  'ArrowRight',
                  'Home',
                  'End',
                ].includes(e.key)
              ) {
                e.stopPropagation();
              }
            }}
            onBlur={() => confirmRename()}
            aria-invalid={!!renameDraft.error}
            className="bg-neutral-700 outline outline-blue-300 py-0.5 text-neutral-300 text-xs indent-1"
          />
        ) : (
          <span className="text-[0.82rem] font-light text-neutral-300">
            {file.name}
          </span>
        )}
      </div>

      {newDraft !== null &&
        newDraft.dir === file.path &&
        showCreateFileNode && (
          <CreateFileNode onBlur={handleOnBlur} depth={depth} />
        )}
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
