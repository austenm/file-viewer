import normalizePath from '../utils/normalizePath';

export const buildPathName = (dir: string, name: string) =>
  normalizePath(`${dir.replace(/\/+$/, '')}/${name}`);
