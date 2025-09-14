import { useEffect, useRef } from 'react';
import * as monaco from 'monaco-editor';
import { getContent } from '../lib/contentStore';
import { getOrCreateModel, releaseModel } from '../lib/monaco/model-utils';
import { tabIdFromPath } from '../utils/ids';
import { perf } from '../utils/perf';
import { useResizeObserver } from '../hooks/useResizeObserver';
import { useFileActions, useFileState } from '../state/ActiveFileProvider';

const Editor = ({ onChange }: { onChange?: (value: string) => void }) => {
  const { activePath } = useFileState();
  const { setIsDirty } = useFileActions();
  const containerRef = useRef<HTMLDivElement | null>(null);
  const editorRef = useRef<monaco.editor.IStandaloneCodeEditor | null>(null);
  const modelPathRef = useRef<string | null>(null);
  const applyingExternalRef = useRef(false);

  useEffect(() => {
    const container = containerRef.current;
    if (!container || !activePath) return;

    // if no editor ref, create new
    if (!editorRef.current) {
      perf.mark('editor:create:start');
      editorRef.current = monaco.editor.create(container, {
        readOnly: false,
        automaticLayout: false,
        minimap: { enabled: true },
        fontSize: 13,
        theme: 'vs-dark',

        renderValidationDecorations: 'off',
        lightbulb: {
          enabled: (monaco as any).editor?.ShowLightbulbIconMode?.Off,
        },
        quickSuggestions: { other: false, comments: false, strings: false },
        suggestOnTriggerCharacters: false,
        wordBasedSuggestions: 'off',
        parameterHints: { enabled: false },
      });

      perf.mark('editor:create:end');
      perf.measure('editor:create', 'editor:create:start', 'editor:create:end');
    }
  }, []);

  useResizeObserver(containerRef.current, () => {
    editorRef.current?.layout();
  });

  useEffect(() => {
    // set up language model when filepath/content changes
    const editor = editorRef.current;
    if (!editor) return;
    const model = getOrCreateModel(activePath!, getContent);

    perf.mark('editor:model:set:start');
    editor.setModel(model);
    perf.mark('editor:model:set:end');
    perf.measure(
      'editor:model:set',
      'editor:model:set:start',
      'editor:model:set:end',
    );
    modelPathRef.current = activePath;
    const sub = model.onDidChangeContent(() => {
      if (applyingExternalRef.current) return;
      const value = model.getValue();
      setIsDirty(activePath!, value !== getContent(activePath!));
      onChange?.(value);
    });

    return () => {
      sub.dispose();
      if (modelPathRef.current) {
        releaseModel(modelPathRef.current);
        modelPathRef.current = null;
      }
    };
  }, [activePath, onChange]);

  return (
    <div
      role="tabpanel"
      id="editor-panel"
      aria-labelledby={tabIdFromPath(activePath!)}
      ref={containerRef}
      className="h-full w-full min-h-0"
    />
  );
};

export default Editor;
