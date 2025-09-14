import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import * as MU from '../../lib/monaco/model-utils';
import * as monaco from 'monaco-editor';

describe('model-utils', () => {
  let warnSpy: ReturnType<typeof vi.spyOn>;
  const OLD_ENV = process.env.NODE_ENV;

  beforeEach(() => {
    process.env.NODE_ENV = 'development';
    warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
  });

  afterEach(() => {
    process.env.NODE_ENV = OLD_ENV;
    warnSpy.mockRestore();
  });

  it('langFromExt maps common extensions', () => {
    expect(MU.langFromExt('a.ts')).toBe('typescript');
    expect(MU.langFromExt('a.tsx')).toBe('typescript');
    expect(MU.langFromExt('a.js')).toBe('javascript');
    expect(MU.langFromExt('a.jsx')).toBe('javascript');
    expect(MU.langFromExt('a.json')).toBe('json');
    expect(MU.langFromExt('a.md')).toBe('markdown');
    expect(MU.langFromExt('a.css')).toBe('css');
    expect(MU.langFromExt('a.html')).toBe('html');
    expect(MU.langFromExt('a.unknown')).toBe('plaintext');
  });

  it('pathToUri encodes segments safely', () => {
    const uri = MU.pathToUri('foo bar/baz#qux.md');
    expect(uri.toString()).toBe('inmem:/foo%20bar/baz%23qux.md');
    expect((uri as any).path).toBe('/foo%20bar/baz%23qux.md');
  });

  it('acquireModel creates a new model with string initialValue', () => {
    const path = 'src/a.ts';
    const m = MU.acquireModel(path, 'hello');
    expect(m).toBeTruthy();
    const uri = MU.pathToUri(path);
    expect(monaco.editor.getModel(uri)).toBe(m);
  });

  it('getOrCreateModel uses function initialValue and reuses same instance', () => {
    const path = 'src/reuse.ts';
    const first = MU.getOrCreateModel(path, () => 'seed-1');
    const second = MU.getOrCreateModel(path, () => 'seed-2');
    expect(second).toBe(first);

    const uri = MU.pathToUri(path);
    expect(monaco.editor.getModel(uri)).toBe(first);
  });

  it('releaseModel decrements refcount and disposes at zero', () => {
    const path = 'src/refcount.ts';
    const m1 = MU.acquireModel(path, 'x');
    const m2 = MU.acquireModel(path, 'y');
    expect(m2).toBe(m1);

    MU.releaseModel(path);
    expect(monaco.editor.getModel(MU.pathToUri(path))).toBe(m1);

    MU.releaseModel(path);
    expect(monaco.editor.getModel(MU.pathToUri(path))).toBeNull();

    MU.releaseModel(path);
  });

  it('disposal with positive refcount triggers dev warning and cleans registry', () => {
    const path = 'src/leak.ts';
    const m = MU.acquireModel(path, 'z');

    m.dispose();

    expect(warnSpy).toHaveBeenCalledWith(
      expect.stringMatching(/\[monaco\] model disposed with positive refcount/),
      expect.stringContaining('inmem:/'),
    );

    expect(monaco.editor.getModel(MU.pathToUri(path))).toBeNull();
    MU.releaseModel(path);
  });
});
