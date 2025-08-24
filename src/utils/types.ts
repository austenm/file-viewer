export type FileNode = {
  name: string;
  path: string;
  children?: FileNode[] | null;
};
