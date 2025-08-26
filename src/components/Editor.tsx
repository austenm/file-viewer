import { useEffect, useRef } from 'react';
import * as monaco from 'monaco-editor';
import { getContent } from '../lib/contentStore';
import { pathToUri, langFromExt } from '../lib/monaco/model-utils';
import { tabIdFromPath } from '../utils/ids';

const Editor = ({ activePath }: { activePath: string }) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const editorRef = useRef<monaco.editor.IStandaloneCodeEditor | null>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container || !activePath) return;

    // if no editor ref, create new
    if (!editorRef.current) {
      editorRef.current = monaco.editor.create(container, {
        readOnly: true,
        automaticLayout: true,
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
    }

    // set up language model when filepath/content changes
    const uri = pathToUri(activePath);
    const model = monaco.editor.createModel(
      getContent(activePath),
      langFromExt(activePath),
      uri,
    );
    editorRef.current.setModel(model);

    return () => {
      model.dispose();
      if (!container.isConnected && editorRef.current) {
        editorRef.current?.dispose();
        editorRef.current = null;
      }
    };
  }, [activePath]);

  return (
    <div
      role="tabpanel"
      id="editor-panel"
      aria-labelledby={tabIdFromPath(activePath)}
      ref={containerRef}
      className="h-full w-full min-h-0"
    />
  );
};

export default Editor;
