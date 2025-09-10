import files from '../data/reactTutorialFiles';
import normalizePath from '../utils/normalizePath';

const byPath = new Map<string, string>();
export const folders = new Set<string>();
const listeners = new Set<() => void>();

for (const f of files.files) {
  byPath.set(normalizePath(f.path), f.content ?? '');
}

let pathsSnapshot: string[] = [];
const recomputePathsSnapshot = () => {
  pathsSnapshot = [
    ...Array.from(folders).map((f) => (f.endsWith('/') ? f : f + '/')),
    ...Array.from(byPath.keys()),
  ].sort();
};

function emit() {
  listeners.forEach((fn) => fn());
}

const isUnder = (p: string, base: string) =>
  p === base || p.startsWith(base + '/');

export const getContent = (p: string) => byPath.get(normalizePath(p)) ?? '';

export const setContent = (p: string, text: string) => {
  const norm = normalizePath(p);
  const isNew = !byPath.has(norm);
  byPath.set(norm, text);
  if (isNew) {
    recomputePathsSnapshot();
    emit();
  }
  schedulePersist();
};

export const deleteContent = (p: string) => {
  const norm = normalizePath(p);
  if (byPath.delete(norm)) {
    recomputePathsSnapshot();
    emit();
  }
  schedulePersist();
};

export const renamePath = (oldPathRaw: string, newPathRaw: string) => {
  const newPath = normalizePath(newPathRaw);
  const oldPath = normalizePath(oldPathRaw);
  if (byPath.has(newPath) || !byPath.has(oldPath)) return false;
  const content = byPath.get(oldPath) ?? '';
  byPath.delete(oldPath);
  byPath.set(newPath, content);
  recomputePathsSnapshot();
  emit();
  schedulePersist();
  return true;
};

export const getAllPaths = () => Array.from(byPath.keys());

export const subscribePaths = (cb: () => void) => {
  listeners.add(cb);
  return () => listeners.delete(cb);
};

export const hasPath = (p: string) => byPath.has(normalizePath(p));

export const getPathsSnapshot = () => pathsSnapshot;

export const addFolder = (dirPath: string) => {
  const dir = normalizePath(dirPath);
  if (!folders.has(dir)) {
    folders.add(dir);
    recomputePathsSnapshot();
    emit();
  }
  schedulePersist();
};

export const deleteTree = (baseRaw: string) => {
  const base = normalizePath(baseRaw);
  let changed = false;

  // delete the file itself (if base is a file)
  if (byPath.delete(base)) changed = true;

  // delete all files under base as a folder
  for (const p of Array.from(byPath.keys())) {
    if (isUnder(p, base) && p !== base) {
      byPath.delete(p);
      changed = true;
    }
  }

  // delete the folder entry and any subfolders
  for (const f of Array.from(folders)) {
    if (isUnder(f, base)) {
      folders.delete(f);
      changed = true;
    }
  }

  if (changed) {
    recomputePathsSnapshot();
    emit();
    schedulePersist();
  }
};

export const renameFolder = (oldDirRaw: string, newDirRaw: string) => {
  const oldDir = normalizePath(oldDirRaw);
  const newDir = normalizePath(newDirRaw);

  if (!folders.has(oldDir) || folders.has(newDir)) return false;
  for (const p of Array.from(byPath.keys())) {
    if (isUnder(p, oldDir)) {
      const moved = newDir + p.slice(oldDir.length);
      byPath.set(moved, byPath.get(p)!);
      byPath.delete(p);
    }
  }

  for (const f of Array.from(folders)) {
    if (isUnder(f, oldDir)) {
      folders.delete(f);
      folders.add(newDir + f.slice(oldDir.length));
    }
  }

  folders.delete(oldDir);
  folders.add(newDir);

  recomputePathsSnapshot();
  emit();
  schedulePersist();
  return true;
};

let timer: number | null = null;
const schedulePersist = () => {
  if (typeof window === 'undefined') return;
  if (timer) window.clearTimeout(timer);
  timer = window.setTimeout(() => {
    const data = {
      files: Object.fromEntries(byPath),
      folders: Array.from(folders ?? []),
    };
    localStorage.setItem('fv:files:v1', JSON.stringify(data));
  }, 200);
};

let initialized = false;

(function initStore() {
  if (initialized) return;
  initialized = true;

  try {
    if (typeof window !== 'undefined') {
      const raw = localStorage.getItem('fv:files:v1');
      if (raw) {
        const { files, folders: fs } = JSON.parse(raw);
        if (files) {
          for (const [p, txt] of Object.entries(files)) {
            byPath.set(normalizePath(p), String(txt));
          }
        }
        if (Array.isArray(fs)) {
          fs.forEach((f) => folders.add(`${normalizePath(f)}/`));
        }
      } else {
        // seed demo data if no LS payload
        for (const f of files.files) {
          byPath.set(normalizePath(f.path), f.content ?? '');
        }
      }
    } else {
      // SSR/test environment: seed demo data
      for (const f of files.files) {
        byPath.set(normalizePath(f.path), f.content ?? '');
      }
    }
  } catch {
    // on parse error, fall back to seed
    for (const f of files.files) {
      byPath.set(normalizePath(f.path), f.content ?? '');
    }
  } finally {
    recomputePathsSnapshot(); // exactly once after hydrate/seed
  }
})();

export function __resetStoreForTests(opts?: {
  files?: Array<{ path: string; content?: string }>;
  folders?: string[];
  clearLocalStorage?: boolean;
}) {
  if (opts?.clearLocalStorage && typeof window !== 'undefined') {
    try {
      localStorage.clear();
    } catch {}
  }
  byPath.clear();
  folders.clear();

  if (opts?.folders) {
    for (const f of opts.folders)
      folders.add(normalizePath(f).replace(/\/+$/, ''));
  }
  if (opts?.files) {
    for (const f of opts.files)
      byPath.set(normalizePath(f.path), f.content ?? '');
  }

  recomputePathsSnapshot();
  emit();
}
