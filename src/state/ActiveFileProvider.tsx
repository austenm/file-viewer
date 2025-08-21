import React, { createContext, useContext, useMemo, useState } from 'react';
import normalizePath from '../utils/normalizePath';

type FileState = {
  activePath: string | null;
};

type FileActions = {
  setActivePath: (path: string | null) => void;
  openFile: (path: string) => void;
  closeFile: () => void;
};

const FileStateContext = createContext<FileState | null>(null);
const FileActionsContext = createContext<FileActions | null>(null);

const ActiveFileProvider = ({ children }: { children: React.ReactNode }) => {
  const [activePath, setActivePath] = useState<string | null>(null);

  const fileState = useMemo<FileState>(() => ({ activePath }), [activePath]);

  const fileActions = useMemo<FileActions>(
    () => ({
      setActivePath: (path) => setActivePath(path ? normalizePath(path) : null),

      openFile: (path) => {
        setActivePath(normalizePath(path));
      },

      closeFile: () => {
        setActivePath(null);
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

export const useActivePath = () => {
  const ctx = useContext(FileStateContext);
  if (!ctx) {
    throw new Error('useActivePath must be used within ActiveFileProvider');
  }
  return ctx.activePath;
};

export const useFileActions = () => {
  const ctx = useContext(FileActionsContext);
  if (!ctx)
    throw new Error('useFileActions must be used within ActiveFileProvider');
  return ctx;
};

export default ActiveFileProvider;
