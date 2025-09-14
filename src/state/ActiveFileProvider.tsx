import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import * as monaco from 'monaco-editor';
import {
  addFolder,
  deleteTree,
  folders,
  getContent,
  getPathsSnapshot,
  hasPath,
  renameFolder,
  renamePath,
  setContent,
} from '../lib/contentStore';
import { pathToUri } from '../lib/monaco/model-utils';
import normalizePath from '../utils/normalizePath';
import ancestorsOf from '../utils/ancestorsOf';
import { validateFileName } from '../lib/validateFileName';
import { buildPathName } from '../lib/buildPathName';
import { validateFolderName } from '../lib/validateFolderName';

type FileState = {
  activePath: string | null;
  openPaths: string[];
  expandedPaths: Set<string>;
  treeFocusPath: string | null;
  dirtyByPath: Map<string, boolean>;
  newDraft: { dir: string; name: string; error: string | null } | null;
  renameDraft: { path: string; name: string; error: string | null } | null;
  newFolderDraft: { dir: string; name: string; error: string | null } | null;
};

type FileActions = {
  setActivePath: (path: string | null) => void;
  openFile: (path: string) => void;
  closeFile: (path: string) => void;
  toggleExpanded: (path: string) => void;
  setTreeFocusPath: (path: string | null) => void;
  ensureExpandedUpTo: (path: string) => void;
  setIsDirty: (path: string, isDirty?: boolean) => void;
  saveFile: (path: string) => void;
  deletePathAt: (path: string) => void;
  beginNewFileAt: (dir: string) => void;
  setNewFileName: (name: string) => void;
  cancelNewFile: () => void;
  confirmNewFile: () => void;
  beginRenameAt: (path: string) => void;
  setRenameName: (name: string) => void;
  cancelRename: () => void;
  confirmRename: () => void;
  beginNewFolderAt: (dir: string) => void;
  setNewFolderName: (name: string) => void;
  cancelNewFolder: () => void;
  confirmNewFolder: () => void;
};

// for seeding tests
type InitialSeed = Partial<{
  activePath: string | null;
  openPaths: string[];
  expandedPaths: Iterable<string>;
  treeFocusPath: string | null;
}>;

const FileStateContext = createContext<FileState | null>(null);
const FileActionsContext = createContext<FileActions | null>(null);

const initialActive = 'app/README.md';
const initialOpen = [initialActive];

const ActiveFileProvider = ({
  children,
  initial,
}: {
  children: React.ReactNode;
  initial?: InitialSeed;
}) => {
  const [activePath, setActivePath] = useState<string | null>(() =>
    initial?.activePath ? normalizePath(initial.activePath) : initialActive,
  );

  const [openPaths, setOpenPaths] = useState<string[]>(() => {
    const base = initial?.openPaths?.map(normalizePath) ?? initialOpen;
    return activePath && !base.includes(activePath)
      ? [...base, activePath]
      : base;
  });

  const [expandedPaths, setExpandedPaths] = useState<Set<string>>(() => {
    if (initial?.expandedPaths) {
      return new Set(Array.from(initial.expandedPaths, normalizePath));
    }
    const seeds = new Set<string>();
    if (activePath) ancestorsOf(activePath).forEach((path) => seeds.add(path));
    openPaths.forEach((path) =>
      ancestorsOf(path).forEach((anc) => seeds.add(anc)),
    );
    return new Set(seeds);
  });

  const [treeFocusPath, setTreeFocusPath] = useState<string | null>(() =>
    initial?.treeFocusPath ? normalizePath(initial.treeFocusPath) : null,
  );

  const [dirtyByPath, setDirtyByPath] = useState<Map<string, boolean>>(
    new Map(),
  );

  const [newDraft, setNewDraft] = useState<{
    dir: string;
    name: string;
    error: string | null;
  } | null>(null);

  const [renameDraft, setRenameDraft] = useState<{
    path: string;
    name: string;
    error: string | null;
  } | null>(null);

  const [newFolderDraft, setNewFolderDraft] = useState<{
    dir: string;
    name: string;
    error: string | null;
  } | null>(null);

  const dirtyRef = useRef(dirtyByPath);
  const pendingCreateRef = useRef<string | null>(null);
  const pendingRenameRef = useRef<string | null>(null);
  const oldNameRef = useRef<string | null>(null);
  const pendingCreateFolderRef = useRef<string | null>(null);

  const ensureExpandedUpTo = (path: string) => {
    const dirs = ancestorsOf(path).slice(0, -1);
    setExpandedPaths((prev) => {
      const next = new Set(prev);
      for (const d of dirs) next.add(d);
      return next;
    });
  };

  const joinDir = (dir: string, rest: string) => {
    const base = normalizePath(dir).replace(/\/+$/, '');
    const tail = (rest ?? '').replace(/^\/+/, '');
    return tail ? `${base}/${tail}` : base;
  };

  const isUnder = (candidate: string, base: string) => {
    const cNorm = normalizePath(candidate);
    const bNorm = normalizePath(base);
    return cNorm === bNorm || cNorm.startsWith(bNorm + '/');
  };

  const hasDirtyUnder = (path: string) => {
    for (const [p, dirty] of dirtyRef.current) {
      if (dirty && isUnder(p, path)) return true;
    }
    return false;
  };

  const affectedPathsForDelete = (base: string) => {
    const bNorm = normalizePath(base);
    return getPathsSnapshot().filter((p) => isUnder(p, bNorm));
  };

  const openFileImpl = useCallback(
    (path: string) => {
      const pNorm = normalizePath(path);
      setOpenPaths((prev) => (prev.includes(pNorm) ? prev : [...prev, pNorm]));
      setActivePath(pNorm);
      ensureExpandedUpTo(pNorm);
      setTreeFocusPath(pNorm);
    },
    [ensureExpandedUpTo],
  );

  const confirmRenameImpl = useCallback(
    (oldPath: string, newPath: string) => {
      const oldB = normalizePath(oldPath);
      const isDirDraft = newPath.endsWith('/');
      const newB = normalizePath(newPath);

      const ok = isDirDraft ? renameFolder(oldB, newB) : renamePath(oldB, newB);
      if (!ok) return;

      const suffixAfter = (base: string, full: string) =>
        full === base ? '' : full.slice(base.length + 1);

      setDirtyByPath((prev) => {
        const next = new Map(prev);
        if (isDirDraft) {
          for (const [p, dirty] of prev) {
            if (!dirty) continue;
            if (isUnder(p, oldB)) {
              next.delete(p);
              const suffix = suffixAfter(oldB, p);
              next.set(suffix ? `${newB}/${suffix}` : newB, true);
            }
          }
        } else {
          const was = !!next.get(oldB);
          next.delete(oldB);
          if (was) next.set(newB, true);
        }
        return next;
      });

      setOpenPaths((prev) =>
        isDirDraft
          ? prev.map((p) => {
              if (!isUnder(p, oldB)) return p;
              const suffix = suffixAfter(oldB, p);
              return suffix ? `${newB}/${suffix}` : newB;
            })
          : prev.map((p) => (p === oldB ? newB : p)),
      );

      setActivePath((curr) => {
        if (!curr) return curr;
        if (!isDirDraft) return curr === oldB ? newB : curr;
        if (!isUnder(curr, oldB)) return curr;
        const suffix = suffixAfter(oldB, curr);
        return suffix ? `${newB}/${suffix}` : newB;
      });

      setExpandedPaths((prev) => {
        const next = new Set<string>();
        for (const p of prev) {
          if (isDirDraft && isUnder(p, oldB)) {
            const suffix = suffixAfter(oldB, p);
            next.add(suffix ? `${newB}/${suffix}` : newB);
          } else if (!isDirDraft && p === oldB) {
            next.add(newB);
          } else {
            next.add(p);
          }
        }
        return next;
      });

      setTreeFocusPath((path) => {
        if (!path) return path;
        if (!isDirDraft) return path === oldB ? newB : path;
        if (!isUnder(path, oldB)) return path;
        const suffix = suffixAfter(oldB, path);
        return suffix ? `${newB}/${suffix}` : newB;
      });

      ensureExpandedUpTo(newB);
      setTreeFocusPath(newB);
    },
    [ensureExpandedUpTo],
  );

  const confirmNewFolderImpl = useCallback(
    (dir: string) => {
      addFolder(dir);
      ensureExpandedUpTo(dir);
      setTreeFocusPath(dir);
    },
    [ensureExpandedUpTo],
  );
  useEffect(() => {
    dirtyRef.current = dirtyByPath;
  }, [dirtyByPath]);

  useEffect(() => {
    const p = pendingCreateRef.current;
    if (!p) return;
    pendingCreateRef.current = null;

    setContent(p, '');
    openFileImpl(p);
  }, [openFileImpl]);

  useEffect(() => {
    const newPathRef = pendingRenameRef.current;
    const oldPathRef = oldNameRef.current;
    if (!newPathRef || !oldPathRef) return;
    pendingRenameRef.current = null;
    oldNameRef.current = null;
    confirmRenameImpl(oldPathRef, newPathRef);
  }, [confirmRenameImpl]);


  const dirtyAny = useMemo(() => {
    for (const v of dirtyByPath.values()) if (v) return true;
    return false;
  }, [dirtyByPath]);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    if (!dirtyAny) return;
    const onBeforeUnload = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = '';
    };

    window.addEventListener('beforeunload', onBeforeUnload);
    return () => {
      window.removeEventListener('beforeunload', onBeforeUnload);
    };
  }, [dirtyAny]);

  useEffect(() => {
    dirtyRef.current = dirtyByPath;
  }, [dirtyByPath]);

  useEffect(() => {
    const p = pendingCreateRef.current;
    if (!p) return;
    pendingCreateRef.current = null;

    setContent(p, '');
    openFileImpl(p);
  }, [openFileImpl]);

  useEffect(() => {
    const newPathRef = pendingRenameRef.current;
    const oldPathRef = oldNameRef.current;
    if (!newPathRef || !oldPathRef) return;
    pendingRenameRef.current = null;
    oldNameRef.current = null;
    confirmRenameImpl(oldPathRef, newPathRef);
  }, [confirmRenameImpl]);

  useEffect(() => {
    const newFolderRef = pendingCreateFolderRef.current;
    if (!newFolderRef) return;
    pendingCreateFolderRef.current = null;
    confirmNewFolderImpl(newFolderRef);
  }, [confirmNewFolderImpl]);

  const fileState = useMemo<FileState>(() => {
    return {
      activePath,
      openPaths,
      expandedPaths,
      treeFocusPath,
      dirtyByPath,
      newDraft,
      renameDraft,
      newFolderDraft,
    };
  }, [
    activePath,
    openPaths,
    expandedPaths,
    treeFocusPath,
    dirtyByPath,
    newDraft,
    renameDraft,
    newFolderDraft,
  ]);

  const fileActions = useMemo<FileActions>(
    () => ({
      setActivePath: (path) => {
        if (path !== null) {
          setActivePath(normalizePath(path));
          ensureExpandedUpTo(path);
        } else {
          setActivePath(null);
        }
      },

      openFile: openFileImpl,

      closeFile: (path) => {
        const pNorm = normalizePath(path);
        if (dirtyByPath.get(pNorm)) {
          const ok = window.confirm('Close without saving?');
          if (!ok) return;
        }
        setOpenPaths((prev) => {
          const i = prev.indexOf(pNorm);
          if (i === -1) return prev;
          const next = [...prev.slice(0, i), ...prev.slice(i + 1)];
          setActivePath((curr) => {
            if (curr !== pNorm) return curr;
            if (next.length === 0) return null;
            return prev[i + 1] ?? prev[i - 1] ?? null;
          });
          return next;
        });
      },

      toggleExpanded: (path) => {
        const pNorm = normalizePath(path);
        setExpandedPaths((prev) => {
          const next = new Set(prev);
          next.has(pNorm) ? next.delete(pNorm) : next.add(pNorm);
          return next;
        });
      },

      setTreeFocusPath: (path: string | null) => {
        setTreeFocusPath(path ? normalizePath(path) : null);
      },

      ensureExpandedUpTo,

      setIsDirty: (path: string, isDirty?: boolean) => {
        const pNorm = normalizePath(path);
        setDirtyByPath((prev) => {
          const next = new Map(prev);
          const current = next.get(pNorm) ?? false;
          next.set(pNorm, isDirty ?? !current);
          return next;
        });
      },

      saveFile: (path: string) => {
        const pNorm = normalizePath(path);
        const uri = pathToUri(pNorm);
        const model = monaco.editor.getModel(uri);
        const text = model?.getValue() ?? getContent(pNorm);
        setContent(pNorm, text);
        setDirtyByPath((prev) => {
          const next = new Map(prev);
          next.set(pNorm, false);
          return next;
        });
      },

      deletePathAt: (path: string) => {
        const pNorm = normalizePath(path);
        const affected = affectedPathsForDelete(pNorm);
        if (!affected.length) return;

        if (hasDirtyUnder(pNorm)) {
          const noun = affected.length > 1 ? 'items' : 'file';
          const ok = window.confirm(`Delete ${noun} without saving?`);
          if (!ok) return;
        }

        setOpenPaths((prev) => {
          const next = prev?.filter((p) => !isUnder(p, pNorm));

          setActivePath((curr) => {
            if (!curr || !isUnder(curr, pNorm)) return curr;
            if (next.length === 0) return null;
            const i = prev.indexOf(curr);
            const fallback = prev[i + 1] ?? prev[i - 1] ?? next[0];
            return next.includes(fallback) ? fallback : next[0];
          });

          return next;
        });

        setDirtyByPath((prev) => {
          const next = new Map(prev);
          for (const [p] of affected) {
            if (p === pNorm || p.startsWith(pNorm + '/')) next.delete(p);
          }
          return next;
        });

        setExpandedPaths((prev) => {
          const next = new Set(prev);
          for (const p of Array.from(next)) {
            if (isUnder(p, pNorm)) next.delete(p);
          }
          return next;
        });

        setTreeFocusPath((curr) =>
          curr && isUnder(curr, pNorm) ? null : curr,
        );

        deleteTree(pNorm);
      },

      beginNewFileAt: (dir: string) => {
        ensureExpandedUpTo(dir);
        setNewDraft({ dir, name: '', error: null });
        return;
      },

      setNewFileName: (name: string) => {
        setNewDraft((prev) =>
          prev
            ? {
                ...prev,
                name: name,
                error: validateFileName(name),
              }
            : prev,
        );
        return;
      },

      cancelNewFile: () => {
        setNewDraft(null);
        return;
      },

      confirmNewFile: () => {
        setNewDraft((prev) => {
          if (!prev) return prev;
          const name = prev.name.trim();
          const fullPath = buildPathName(prev.dir, name);
          const err =
            validateFileName(name) ||
            (hasPath(fullPath) ? 'Name already exists' : null);
          if (err) return { ...prev, error: err };

          pendingCreateRef.current = fullPath;
          return null;
        });
      },

      beginRenameAt: (path: string) => {
        const base = path.split('/').pop() ?? path;
        setRenameDraft({ path, name: base, error: null });
        setTreeFocusPath(path);
      },

      setRenameName: (name: string) => {
        setRenameDraft((prev) =>
          prev ? { ...prev, name, error: validateFileName(name) } : prev,
        );
        return;
      },

      cancelRename: () => setRenameDraft(null),

      confirmRename: () => {
        setRenameDraft((prev) => {
          if (!prev) return prev;
          const oldPath = normalizePath(prev.path);
          const isRenameDir = !oldPath.includes('.');
          const dir = oldPath.includes('/')
            ? oldPath.slice(0, oldPath.lastIndexOf('/'))
            : '';
          let newPath = normalizePath(
            dir ? `${dir}/${prev.name.trim()}` : prev.name.trim(),
          );

          if (isRenameDir) {
            newPath = `${newPath}/`;
            const err =
              validateFolderName(newPath) ||
              (newPath !== oldPath && folders.has(newPath)
                ? 'Name already exists'
                : null);
            if (err) return { ...prev, error: err };
          } else {
            const err =
              validateFileName(prev.name.trim()) ||
              (newPath !== oldPath && hasPath(newPath)
                ? 'Name already exists'
                : null);
            if (err) return { ...prev, error: err };
          }

          oldNameRef.current = oldPath;
          pendingRenameRef.current = newPath;

          return null;
        });
      },

      beginNewFolderAt: (dir: string) => {
        ensureExpandedUpTo(dir);
        setNewFolderDraft({ dir: normalizePath(dir), name: '', error: null });
        setTreeFocusPath(dir);
      },

      setNewFolderName: (name: string) => {
        setNewFolderDraft((prev) =>
          prev ? { ...prev, name, error: validateFolderName(name) } : prev,
        );
      },

      cancelNewFolder: () => {
        setNewFolderDraft(null);
      },

      confirmNewFolder: () => {
        setNewFolderDraft((prev) => {
          if (!prev) return prev;
          const full = normalizePath(`${prev.dir}/${prev.name.trim()}/`);
          const err =
            validateFolderName(prev.name.trim()) ||
            (folders.has(full) || hasPath(full.slice(0, -1))
              ? 'Name already exists'
              : null);
          if (err) return { ...prev, error: err };
          pendingCreateFolderRef.current = full;
          return null;
        });
      },
    }),
    [],
  );

  return (
    <FileStateContext.Provider value={fileState}>
      <FileActionsContext.Provider value={fileActions}>
        {children}
      </FileActionsContext.Provider>
    </FileStateContext.Provider>
  );
};

export const useFileState = () => {
  const ctx = useContext(FileStateContext);
  if (!ctx) {
    throw new Error('useFileState must be used within ActiveFileProvider');
  }
  return ctx;
};

export const useFileActions = () => {
  const ctx = useContext(FileActionsContext);
  if (!ctx)
    throw new Error('useFileActions must be used within ActiveFileProvider');
  return ctx;
};

export const useActivePath = () => {
  const ctx = useContext(FileStateContext);
  if (!ctx) {
    throw new Error('useActivePath must be used within ActiveFileProvider');
  }
  return ctx.activePath;
};

export const useOpenPaths = () => {
  const ctx = useContext(FileStateContext);
  if (!ctx) {
    throw new Error('useActivePath must be used within ActiveFileProvider');
  }
  return ctx.openPaths;
};

export const useExpandedPaths = () => {
  const ctx = useContext(FileStateContext);
  if (!ctx) {
    throw new Error('useActivePath must be used within ActiveFileProvider');
  }
  return ctx.expandedPaths;
};

export default ActiveFileProvider;
