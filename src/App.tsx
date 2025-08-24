import { useEffect } from 'react';
import { useActivePath } from './state/ActiveFileProvider';
import { useFileActions } from './state/ActiveFileProvider';
import Editor from './components/Editor';
import FileTree from './components/FileTree';
import reactTutorialFiles from './data/reactTutorialFiles';
import buildTree from './lib/buildTree';
import normalizePath from './utils/normalizePath';
import { PanelGroup, Panel, PanelResizeHandle } from 'react-resizable-panels';

function App() {
  const activePath = useActivePath();
  const { openFile } = useFileActions();

  useEffect(() => {
    if (!activePath) openFile('app/README.md');
  }, []);

  const getContent = (path: string) => {
    const normPath = normalizePath(path);
    return (
      reactTutorialFiles.find((file) => file.path === normPath)?.content ?? ''
    );
  };

  const rootNode = buildTree(reactTutorialFiles);

  return (
    <PanelGroup
      id="file-viewer-group"
      direction="horizontal"
      className="h-full"
    >
      <Panel
        id="file-tree-panel"
        className="min-h-0"
        defaultSize={25}
        minSize={10}
      >
        <FileTree rootNode={rootNode} />
      </Panel>
      <PanelResizeHandle className="border-l-[0.5px] border-l-neutral-600" />
      <Panel id="code-editor-panel" className="min-h-0" defaultSize={75}>
        <Editor
          path={activePath || 'app/package.json'}
          getContent={getContent}
        />
          <Editor activePath={activePath!} />
      </Panel>
    </PanelGroup>
  );
}

export default App;
