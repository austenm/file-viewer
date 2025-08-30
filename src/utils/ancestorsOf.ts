import normalizePath from './normalizePath';

const ancestorsOf = (path: string): string[] => {
  const p = normalizePath(path);
  const parts = p.split('/');
  const out: string[] = [];
  for (let i = 0; i < parts.length; i++) {
    out.push(parts.slice(0, i + 1).join('/'));
  }
  return out;
};

export default ancestorsOf;
