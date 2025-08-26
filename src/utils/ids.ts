export const tabIdFromPath = (p: string) =>
  'tab-' + p.replace(/[^a-zA-Z0-9_-]/g, '-');
