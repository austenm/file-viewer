import React, { createContext, useContext, useMemo, useState } from 'react';
import normalizePath from '../utils/normalizePath';
import ancestorsOf from '../utils/ancestorsOf';

type FileState = {
  activePath: string | null;
  openPaths: string[];
  expandedPaths: Set<string>;
  treeFocusPath: string | null;
};

type FileActions = {
  setActivePath: (path: string | null) => void;
  openFile: (path: string) => void;
  closeFile: (path: string) => void;
  toggleExpanded: (path: string) => void;
  setTreeFocusPath: (path: string | null) => void;
  ensureExpandedUpTo: (path: string) => void;
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

  const ensureExpandedUpTo = (path: string) => {
    const dirs = ancestorsOf(path).slice(0, -1);
    setExpandedPaths((prev) => {
      const next = new Set(prev);
      for (const d of dirs) next.add(d);
      return next;
    });
  };

  const fileState = useMemo<FileState>(() => {
    return { activePath, openPaths, expandedPaths, treeFocusPath };
  }, [activePath, openPaths, expandedPaths, treeFocusPath]);

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

      openFile: (path) => {
        const pNorm = normalizePath(path);
        setOpenPaths((prev) =>
          prev.includes(pNorm) ? prev : [...prev, pNorm],
        );
        setActivePath(pNorm);
        ensureExpandedUpTo(pNorm);
      },

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
    }),
    [],
  );

  const state = useMemo<FileState>(
    () => ({
      activePath,
      openPaths,
      expandedPaths,
      treeFocusPath,
    }),
    [activePath, openPaths, expandedPaths, treeFocusPath],
  );

  return (
    <FileStateContext.Provider value={state}>
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
