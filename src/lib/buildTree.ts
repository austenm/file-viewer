import type { FileNode } from '../utils/types';

const buildTree = (files: { path: string }[]): FileNode => {
  const root: FileNode = { name: '__root__', path: '', children: [] };

  // build file tree from flat file paths
  for (const file of files) {
    const pathArray = file.path.split('/').filter(Boolean);
    let currentNode = root;

    pathArray.forEach((segment, idx) => {
      if (!currentNode.children) {
        currentNode.children = [];
      }
      let nextNodeInPath = currentNode.children.find(
        (seg) => seg.name === segment,
      );
      if (!nextNodeInPath) {
        const fullPath = pathArray.slice(0, idx + 1).join('/');
        nextNodeInPath = { name: segment, path: fullPath, children: [] };
        currentNode.children.push(nextNodeInPath);
      }
      currentNode = nextNodeInPath;
    });

    if (currentNode.children && currentNode.children.length === 0) {
      delete currentNode.children;
    }
  }
  // sort folders above files, alphabetical
  const sortNode = (node: FileNode) => {
    if (!node.children) {
      return;
    }
    node.children.sort((a, b) => {
      const aIsFolder = Array.isArray(a.children);
      const bIsFolder = Array.isArray(b.children);
      if (aIsFolder !== bIsFolder) {
        return aIsFolder ? -1 : 1;
      } else {
        return a.name?.localeCompare(b.name);
      }
    });
    node.children.forEach(sortNode);
  };
  sortNode(root);

  return root;
};

export default buildTree;
