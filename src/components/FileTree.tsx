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

  return (
    <div className="h-full border border-r bg-neutral-800">
      <div className="mb-1 font-bold text-[0.82rem] text-neutral-300">
        {projectName.toUpperCase()}
      </div>
      <div
        role="tree"
        aria-label="Files"
        {rootNode.children?.map((child) => (
          <FileTreeNode key={child.path} file={child} />
        ))}
      </div>
    </div>
  );
};

export default FileTree;
