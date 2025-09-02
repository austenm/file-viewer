// src/test/mocks/monaco-editor.ts
type Disposable = { dispose: () => void };

function makeEvent<T = void>() {
  const listeners = new Set<(e: T) => void>();
  const event = (listener: (e: T) => void): Disposable => {
    listeners.add(listener);
    return { dispose: () => listeners.delete(listener) };
  };
  const fire = (e: T extends void ? never : T) => {
    listeners.forEach((l) => l(e));
  };
  return { event, fire };
}

const models = new Map<string, any>();
const willDisposeGlobal = makeEvent<any>();

export const editor = {
  ShowLightbulbIconMode: { Off: 0 } as any,

  create: () => {
    let _model: any = null;
    return {
      setModel: (m: any) => {
        _model = m;
      },
      getModel: () => _model,
      dispose: () => {},
      onDidChangeModelContent: () => ({ dispose: () => {} }),
      layout: () => {},
    };
  },

  createModel: (text: string = '', _lang?: string, uri?: any) => {
    const u = uri ?? Uri.parse(`inmem:/model-${models.size}`);
    const key = u.toString();

    const didChange = makeEvent<void>();
    const willDispose = makeEvent<void>();

    const model = {
      uri: u,
      _text: text,
      getValue: () => model._text,
      setValue: (v: string) => {
        model._text = v;
        didChange.fire(undefined as never);
      },
      onDidChangeContent: didChange.event,
      onWillDispose: willDispose.event,
      dispose: () => {
        // fire per-model then global
        willDispose.fire(undefined as never);
        willDisposeGlobal.fire(model);
        models.delete(key);
      },
      // minimal surface
      getLanguageId: () => _lang ?? 'plaintext',
      isDisposed: () => !models.has(key),
    };

    models.set(key, model);
    return model;
  },

  getModel: (uri: any) => models.get(uri.toString()) ?? null,
  getModels: () => Array.from(models.values()),

  // Global hook (used in our registry’s safety net)
  onWillDisposeModel: willDisposeGlobal.event,
};

export const Uri = {
  file: (p: string) => ({
    path: p,
    toString: () => `file://${p}`,
  }),
  parse: (s: string) => ({
    // normalize to something path-like; not used heavily in tests
    path: s.replace(/^[a-zA-Z]+:\/*/, '/'),
    toString: () => s,
  }),
};

const monaco = { editor, Uri };
export default monaco;
