import type { FileNode } from '../lib/buildTree';
import { FileIcon } from './FileIcon';

type FileTreeNodeProps = {
  file: FileNode;
  depth?: number;
};

const FileTreeNode = ({ file, depth = 0 }: FileTreeNodeProps) => {
  const isFolder = Array.isArray(file.children) && file.children.length > 0;

  return (
    <div>
      <div
        className="flex items-center gap-1 hover:cursor-pointer"
        style={{ paddingLeft: `${depth / 2}rem` }}
      >
        <div>
          <FileIcon fileName={file.path} />
        </div>
        <div className="text-sm font-light text-gray-100">{file.name}</div>
      </div>

      {isFolder &&
        file.children!.map((child) => (
          <FileTreeNode key={child.path} file={child} depth={depth + 1} />
        ))}
    </div>
  );
};

export default FileTreeNode;
