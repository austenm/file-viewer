import React, { createContext, useContext, useMemo, useState } from 'react';
import normalizePath from '../utils/normalizePath';

type FileState = {
  activePath: string | null;
  openPaths: string[];
};

type FileActions = {
  setActivePath: (path: string | null) => void;
  openFile: (path: string) => void;
  closeFile: (path: string) => void;
};

const FileStateContext = createContext<FileState | null>(null);
const FileActionsContext = createContext<FileActions | null>(null);

const ActiveFileProvider = ({ children }: { children: React.ReactNode }) => {
  const [activePath, setActivePath] = useState<string | null>('app/README.md');
  const [openPaths, setOpenPaths] = useState<string[]>(['app/README.md']);

  const fileState = useMemo<FileState>(() => {
    return { activePath, openPaths };
  }, [activePath, openPaths]);

  const fileActions = useMemo<FileActions>(
    () => ({
      setActivePath: (path) => setActivePath(path ? normalizePath(path) : null),

      openFile: (path) => {
        const isAlreadyOpen = openPaths.includes(normalizePath(path));
        if (isAlreadyOpen) {
          setActivePath(normalizePath(path));
        } else {
          setOpenPaths((prevPaths) => [...prevPaths, normalizePath(path)]);
          setActivePath(normalizePath(path));
        }
      },

      closeFile: (path) => {
        const pNorm = normalizePath(path);
        const fileIndex = openPaths.indexOf(pNorm);
        const sliceFromPaths = () => {
          setOpenPaths((prevPaths) => [
            ...prevPaths.slice(0, fileIndex),
            ...prevPaths.slice(fileIndex + 1),
          ]);
        };

        if (pNorm !== activePath) {
          sliceFromPaths();
        } else {
          if (openPaths.length === 1) {
            setActivePath(null);
            setOpenPaths([]);
          } else if (fileIndex < openPaths.length - 1) {
            setActivePath(openPaths[fileIndex + 1]);
            sliceFromPaths();
          } else {
            setActivePath(openPaths[fileIndex - 1]);
            sliceFromPaths();
          }
        }
      },
    }),
    [activePath, openPaths],
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
