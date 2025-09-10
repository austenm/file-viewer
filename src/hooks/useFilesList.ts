import { useCallback, useSyncExternalStore } from 'react';
import { subscribePaths, getPathsSnapshot } from '../lib/contentStore';

export default function useFilesList(): string[] {
  const subscribe = useCallback(subscribePaths, []);
  const getSnap = useCallback(getPathsSnapshot, []);
  return useSyncExternalStore(subscribe, getSnap, getSnap);
}
