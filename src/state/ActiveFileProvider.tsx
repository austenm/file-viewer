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
  beginNewFileAt: (dir: string) => void;
  setNewFileName: (name: string) => void;
  cancelNewFile: () => void;
  confirmNewFile: () => void;
  beginRenameAt: (path: string) => void;
  setRenameName: (name: string) => void;
  cancelRename: () => void;
  confirmRename: () => void;
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


  const dirtyRef = useRef(dirtyByPath);
  const pendingCreateRef = useRef<string | null>(null);
  const pendingRenameRef = useRef<string | null>(null);
  const oldNameRef = useRef<string | null>(null);

  const ensureExpandedUpTo = (path: string) => {
    const dirs = ancestorsOf(path).slice(0, -1);
    setExpandedPaths((prev) => {
      const next = new Set(prev);
      for (const d of dirs) next.add(d);
      return next;
    });
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
      let ok;
      if (newPath.endsWith('/')) {
        ok = renameFolder(oldPath, newPath);
      } else {
        ok = renamePath(oldPath, newPath);
      }
      if (!ok) return;

      setDirtyByPath((prev) => {
        const next = new Map(prev);
        const wasDirty = !!next.get(oldPath);
        next.delete(oldPath);
        if (wasDirty) next.set(newPath, true);
        return next;
      });
      setOpenPaths((prevTabs) =>
        prevTabs.map((p) => (p === oldPath ? newPath : p)),
      );
      setActivePath((curr) => (curr === oldPath ? newPath : curr));
      ensureExpandedUpTo(newPath);
      setTreeFocusPath(newPath);
    },
    [ensureExpandedUpTo],
  );
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


  const fileState = useMemo<FileState>(() => {
    return {
      activePath,
      openPaths,
      expandedPaths,
      treeFocusPath,
      dirtyByPath,
      newDraft,
      renameDraft,
    };
  }, [
    activePath,
    openPaths,
    expandedPaths,
    treeFocusPath,
    dirtyByPath,
    newDraft,
    renameDraft,
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
