import type { FileNode } from '../lib/buildTree';

type FileTreeNodeProps = {
  file: FileNode;
  depth?: number;
};

const FileTreeNode = ({ file, depth = 0 }: FileTreeNodeProps) => {
  const isFolder = Array.isArray(file.children) && file.children.length > 0;
  const indent = depth > 0 ? ` pl-${depth * 4}` : '';
  const rowStyle = `text-sm font-light text-gray-100${indent} `;

  return (
    <div>
      <div className={rowStyle}>{file.name}</div>

      {isFolder &&
        file.children!.map((child) => (
          <FileTreeNode key={child.path} file={child} depth={depth + 1} />
        ))}
    </div>
  );
};

export default FileTreeNode;
