import { useEffect, useRef } from 'react';
import * as monaco from 'monaco-editor';

const langFromExt = (path: string) => {
  const ext = (path.split('.').pop() || '').toLowerCase();
  switch (ext) {
    case 'ts':
    case 'tsx':
      return 'typescript';
    case 'js':
    case 'jsx':
      return 'javascript';
    case 'json':
      return 'json';
    case 'md':
      return 'markdown';
    case 'css':
      return 'css';
    case 'html':
      return 'html';
  }
};

const Editor = ({
  path,
  getContent,
}: {
  path: string;
  getContent: (p: string) => string;
}) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const editorRef = useRef<monaco.editor.IStandaloneCodeEditor | null>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container || !path) return;

    // if no editor ref, create new
    if (!editorRef.current) {
      editorRef.current = monaco.editor.create(container, {
        readOnly: true,
        automaticLayout: true,
        minimap: { enabled: true },
        fontSize: 13,
        theme: 'vs-dark',
      });
    }

    // set up language model when filepath/content changes
    const uri = monaco.Uri.parse(`inmem:/${encodeURI(path)}`);
    const model = monaco.editor.createModel(
      getContent(path),
      langFromExt(path),
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
  }, [path, getContent]);

  return (
    <div
      role="text editor"
      ref={containerRef}
      className="h-full w-full min-h-0"
    />
  );
};

export default Editor;
