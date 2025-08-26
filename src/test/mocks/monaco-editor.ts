export const editor = {
  ShowLightbulbIconMode: { Off: 0 } as any,
  create: () => ({
    setModel: () => {},
    dispose: () => {},
    onDidChangeModelContent: () => ({ dispose: () => {} }),
    layout: () => {},
  }),
  createModel: () => ({ dispose: () => {} }),
  getModels: () => [],
  getModel: () => null,
};

export const Uri = {
  file: (p: string) => ({
    path: p,
    toString: () => `file://${p}`,
  }),
  parse: (s: string) => ({
    path: s.replace(/^file:\/\//, ''),
    toString: () => s,
  }),
};

const monaco = { editor, Uri };
export default monaco;
