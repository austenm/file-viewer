import files from '../data/reactTutorialFiles';
import normalizePath from '../utils/normalizePath';

const byPath = new Map<string, string>();
export const folders = new Set<string>();
const listeners = new Set<() => void>();

let pathsSnapshot: string[] = [];
const recomputePathsSnapshot = () => {
  pathsSnapshot = [
    ...Array.from(folders).map((f) => `${f}/`),
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
  onUserMutation();
};

export const deleteContent = (p: string) => {
  const norm = normalizePath(p);
  if (byPath.delete(norm)) {
    recomputePathsSnapshot();
    emit();
  }
  schedulePersist();
  onUserMutation();
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
  onUserMutation();
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
  onUserMutation();
};

export const deleteTree = (baseRaw: string) => {
  const base = normalizePath(baseRaw);
  const prefix = base + '/';
  let changed = false;

  if (byPath.delete(base)) changed = true;

  for (const p of Array.from(byPath.keys())) {
    if (p.startsWith(prefix)) {
      byPath.delete(p);
      changed = true;
    }
  }

  for (const f of Array.from(folders)) {
    if (f === base || f.startsWith(prefix)) {
      folders.delete(f);
      changed = true;
    }
  }

  if (changed) {
    recomputePathsSnapshot();
    emit();
    schedulePersist();
    onUserMutation();
  }
};

export const renameFolder = (oldDirRaw: string, newDirRaw: string) => {
  const oldDir = normalizePath(oldDirRaw);
  const newDir = normalizePath(newDirRaw);

  const hasFilesUnderOld = Array.from(byPath.keys()).some((p) =>
    p.startsWith(oldDir + '/'),
  );
  const hasFoldersUnderOld =
    folders.has(oldDir) ||
    Array.from(folders).some((f) => f.startsWith(oldDir + '/'));

  if (!hasFilesUnderOld && !hasFoldersUnderOld) return false;
  if (folders.has(newDir)) return false;
  if (oldDir === newDir) return true;

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
  onUserMutation();
  return true;
};

const SEED_KEY = 'fv:files:v1';
const SEEDED_FLAG = 'fv:seeded:v1';

let timer: number | null = null;

function persist() {
  const data = {
    files: Object.fromEntries(byPath),
    folders: Array.from(folders),
  };
  localStorage.setItem(SEED_KEY, JSON.stringify(data));
}

export function persistNow() {
  if (timer) {
    clearTimeout(timer);
    timer = null;
  }
  persist();
}

export function schedulePersist(delay = 250) {
  if (timer) clearTimeout(timer);
  timer = window.setTimeout(() => {
    timer = null;
    persist();
  }, delay);
}

function onUserMutation() {
  localStorage.setItem('fv:seeded:v1', '1');
}

let initialized = false;

(function initStore() {
  if (initialized) return;
  initialized = true;

  try {
    if (typeof window !== 'undefined') {
      const raw = localStorage.getItem(SEED_KEY);
      const seeded = localStorage.getItem(SEEDED_FLAG) === '1';

      if (raw) {
        const { files, folders: fs } = JSON.parse(raw);
        if (files) {
          for (const [p, txt] of Object.entries(files)) {
            byPath.set(normalizePath(p), String(txt));
          }
        }
        if (Array.isArray(fs)) {
          fs.forEach((f) => folders.add(normalizePath(f)));

          for (const f of Array.from(folders)) {
            const norm = normalizePath(f);
            if (f !== norm) {
              folders.delete(f);
              folders.add(norm);
            }
          }
        }
      } else if (!seeded) {
        for (const f of files.files) {
          byPath.set(normalizePath(f.path), f.content ?? '');
        }
      }
      localStorage.setItem(SEEDED_FLAG, '1');
      persistNow();
    } else {
    }
  } catch {
    for (const f of files.files) {
      byPath.set(normalizePath(f.path), f.content ?? '');
    }
    localStorage?.setItem?.(SEEDED_FLAG, '1');
    persistNow?.();
  } finally {
    recomputePathsSnapshot();
  }
})();

export function __resetStoreForTests(opts?: {
  files?: Array<{ path: string; content?: string }>;
  folders?: string[];
  clearLocalStorage?: boolean;
  seedDemo?: boolean;
}) {
  if (opts?.clearLocalStorage && typeof window !== 'undefined') {
    try {
      localStorage.clear();
    } catch {}
  }
  byPath.clear();
  folders.clear();

  if (opts?.seedDemo) {
    for (const f of files.files) {
      byPath.set(normalizePath(f.path), f.content ?? '');
    }
  } else if (opts?.folders) {
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
