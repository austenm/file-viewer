const enabled = import.meta.env.MODE !== 'production';
export const perf = {
  mark(name: string) {
    if (enabled && 'mark' in performance) performance.mark(name);
  },
  measure(name: string, start: string, end?: string) {
    if (enabled && 'measure' in performance)
      performance.measure(name, start, end);
  },
  entries(name?: string) {
    if (enabled && 'entries' in performance)
      return name
        ? performance.getEntriesByName(name)
        : performance.getEntriesByType('measure');
  },
};
