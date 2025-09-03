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
    default:
      return 'plaintext';
  }
};

const encodePath = (path: string) => {
  normalizePath(path).split('/').map(encodeURIComponent).join('/');
};

export const pathToUri = (path: string) =>
  monaco.Uri.parse(`inmem:/${encodePath(path)}`);

export const getOrCreateModel = (
  path: string,
  getContent: (p: string) => string,
) => {
  return acquireModel(path, () => getContent(path));
};

const registry = new Map<
  string,
  { model: monaco.editor.ITextModel; ref: number }
>();

export const acquireModel = (
  path: string,
  initialValue: string | (() => string),
): monaco.editor.ITextModel => {
  const uri = pathToUri(path);
  const key = uri.toString();
  let entry = registry.get(key);
  if (!entry) {
    const lang = langFromExt(path);
    const text =
      typeof initialValue === 'function'
        ? initialValue()
        : (initialValue ?? '');
    const model =
      monaco.editor.getModel(uri) ?? monaco.editor.createModel(text, lang, uri);
    entry = { model, ref: 0 };
    registry.set(key, entry);

    model.onWillDispose(() => {
      const isDev =
        (typeof import.meta !== 'undefined' && (import.meta as any).env?.DEV) ||
        (typeof process !== 'undefined' &&
          process.env?.NODE_ENV !== 'production');
      if (isDev && (registry.get(key)?.ref ?? 0) > 0) {
        // eslint-disable-next-line no-console
        console.warn('[monaco] model disposed with positive refcount', key);
      }
      registry.delete(key);
    });
  }
  entry.ref += 1;
  return entry.model;
};

export const releaseModel = (path: string): void => {
  const key = pathToUri(path).toString();
  const entry = registry.get(key);
  if (!entry) return;
  entry.ref -= 1;
  if (entry.ref <= 0) {
    entry.model.dispose();
    registry.delete(key);
  }
};
