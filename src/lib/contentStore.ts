import files from '../data/reactTutorialFiles';
import normalizePath from '../utils/normalizePath';

const byPath = new Map<string, string>();
for (const f of files.files) {
  byPath.set(normalizePath(f.path), (f.content ?? '').replace(/^\n/, ''));
}

export const getContent = (p: string) => byPath.get(normalizePath(p)) ?? '';
