import * as monaco from 'monaco-editor';
import normalizePath from '../../utils/normalizePath';

export const langFromExt = (path: string) => {
  const ext = (path.split('.').pop() || '').toLowerCase();
  switch (ext) {
    case 'ts':
    case 'tsx':
      return 'typescript';
    case 'js':
    case 'jsx':
      return 'javascript';
    case 'json':
      return 'json';
    case 'md':
      return 'markdown';
    case 'css':
      return 'css';
    case 'html':
      return 'html';
  }
};

export const pathToUri = (path: string) =>
  monaco.Uri.parse(`inmem:/${encodeURI(normalizePath(path))}`);

export const getOrCreateModel = (
  path: string,
  getContent: (p: string) => string,
) => {
  const uri = pathToUri(path);
  let model = monaco.editor.getModel(uri);
  if (!model) {
    model = monaco.editor.createModel(getContent(path), langFromExt(path), uri);
  }
  return model;
};
