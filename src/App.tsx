import { useFileState } from './state/ActiveFileProvider';
import { Editor, EmptyEditor, FileTree, Tabs } from './components';
import Breadcrumbs from './components/Breadcrumbs';
import reactTutorialFiles from './data/reactTutorialFiles';
import buildTree from './lib/buildTree';
import { PanelGroup, Panel, PanelResizeHandle } from 'react-resizable-panels';

function App() {
  const { activePath, openPaths } = useFileState();

  const rootNode = buildTree(reactTutorialFiles.files);

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
        <FileTree projectName={reactTutorialFiles.name} rootNode={rootNode} />
      </Panel>
      <PanelResizeHandle className="border-l-[0.5px] border-l-neutral-600" />
      <Panel id="code-editor-panel" className="min-h-0" defaultSize={75}>
        {activePath === null && openPaths.length === 0 ? (
          <EmptyEditor />
        ) : (
          <div className="flex flex-col h-full w-full min-h-0">
            <Tabs />
            <Breadcrumbs path={activePath!} />
            <Editor activePath={activePath!} />
          </div>
        )}
      </Panel>
    </PanelGroup>
  );
}

export default App;
