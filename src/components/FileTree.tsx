import { useEffect, useMemo, useRef } from 'react';
import { useFileState, useFileActions } from '../state/ActiveFileProvider';
import type { FileNode } from '../utils/types';
import FileTreeNode from './FileTreeNode';

type FlatNode = {
  path: string;
  name: string;
  isDir: boolean;
  level: number;
  parent?: string;
};

const visibleNodes = (root: FileNode, expandedPaths: Set<string>) => {
  const out = new Array<FlatNode>();
  const dfs = (node: FileNode, level: number, parent?: string) => {
    const isDir = Array.isArray(node.children);
    out.push({
      path: node.path,
      name: node.name,
      isDir,
      level,
      parent,
    });
    if (isDir && node.children && expandedPaths.has(node.path)) {
      node.children.forEach((child) => dfs(child, level + 1, node.path));
    }
  };
  root.children && root.children.forEach((child) => dfs(child, 0, undefined));
  return out;
};

const FileTree = ({
  projectName,
  rootNode,
}: {
  projectName: string;
  rootNode: FileNode;
}) => {
  const { openFile, setTreeFocusPath, toggleExpanded } = useFileActions();
  const { expandedPaths, treeFocusPath } = useFileState();
  const rowRefs = useRef(new Map<string, HTMLDivElement>());

  const flat = useMemo(
    () => visibleNodes(rootNode, expandedPaths),
    [rootNode, expandedPaths],
  );

  const { indexByPath, parentMap } = useMemo(() => {
    const indexByPath = new Map<string, number>();
    const parentMap = new Map<string, string>();
    flat.forEach((n, i) => {
      indexByPath.set(n.path, i);
      if (n.parent) parentMap.set(n.path, n.parent);
    });
    return { indexByPath, parentMap };
  }, [flat]);

  const firstChildIndex = (i: number) =>
    flat[i + 1]?.parent === flat[i].path ? i + 1 : null;

  const isDescendant = (p: string, anc: string) =>
    p !== anc && p.startsWith(anc + '/');

  const registerRowRef = (path: string) => (el: HTMLDivElement | null) => {
    if (el) rowRefs.current.set(path, el);
    else rowRefs.current.delete(path);
  };

  useEffect(() => {
    if (!treeFocusPath && flat.length) setTreeFocusPath(flat[0].path);
  }, [treeFocusPath, flat, setTreeFocusPath]);

  useEffect(() => {
    if (treeFocusPath) {
      const el = rowRefs.current.get(treeFocusPath);
      el?.focus();
    }
  }, [treeFocusPath]);

  const focusByIndex = (i: number) => {
    const path = flat[i]?.path;
    if (!path) return;
    setTreeFocusPath(path);
    const el = rowRefs.current.get(path);
    requestAnimationFrame(() => el?.focus());
    el?.scrollIntoView?.({ block: 'nearest' });
  };

  return (
    <div className="h-full border border-r bg-neutral-800">
      <div className="mb-1 font-bold text-[0.82rem] text-neutral-300">
        {projectName.toUpperCase()}
      </div>
      <div
        role="tree"
        aria-label="Files"
        onKeyDown={(e) => {
          if (!flat.length) return;
          const i = indexByPath.get(treeFocusPath ?? '') ?? 0;
          const node = flat[i];
          const last = flat.length - 1;
          const expanded = expandedPaths.has(node.path);

          switch (e.key) {
            case 'ArrowDown':
              e.preventDefault();
              focusByIndex(Math.min(i + 1, last));
              break;
            case 'ArrowUp':
              e.preventDefault();
              focusByIndex(Math.max(i - 1, 0));
              break;
            case 'Home':
              e.preventDefault();
              focusByIndex(0);
              break;
            case 'End':
              e.preventDefault();
              focusByIndex(last);
              break;
            case 'ArrowLeft':
              e.preventDefault();
              if (node.isDir && expanded) {
                toggleExpanded(node.path);
                requestAnimationFrame(() =>
                  rowRefs.current.get(node.path)?.focus(),
                );
              } else {
                const parent = parentMap.get(node.path);
                if (parent) {
                  setTreeFocusPath(parent);
                  requestAnimationFrame(() =>
                    rowRefs.current.get(parent)?.focus(),
                  );
                }
              }
              break;
            case 'ArrowRight':
              e.preventDefault();
              if (node.isDir && !expanded) {
                toggleExpanded(node.path);
              } else if (node.isDir) {
                const child = firstChildIndex(i);
                if (child !== null) focusByIndex(child);
              }
              break;
            case 'Enter':
            case ' ':
              e.preventDefault();
              if (node.isDir) toggleExpanded(node.path);
              else openFile(node.path);
              break;
          }
        }}
      >
        {rootNode.children?.map((child) => (
          <FileTreeNode
            key={child.path}
            file={child}
            expandedPaths={expandedPaths}
            registerForPath={registerRowRef}
          />
        ))}
      </div>
    </div>
  );
};

export default FileTree;
