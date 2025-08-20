import type { FileNode } from '../lib/buildTree';
import FileTreeNode from './FileTreeNode';

const FileTree = ({ rootNode }: { rootNode: FileNode }) => {
  return (
    <div className="h-[100vh] w-[30%] min-w-[250px] border border-r bg-neutral-800">
      <div className="mb-1 text-xl text-neutral-300">Files</div>
      <div>
        {rootNode.children?.map((child) => (
          <FileTreeNode key={child.path} file={child} />
        ))}
      </div>
    </div>
  );
};

export default FileTree;
