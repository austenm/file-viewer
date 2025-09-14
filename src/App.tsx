import { useFileState, useFileActions } from './state/ActiveFileProvider';
import { Editor, EmptyEditor, FileTree, Tabs } from './components';
import Breadcrumbs from './components/Breadcrumbs';
import { PanelGroup, Panel, PanelResizeHandle } from 'react-resizable-panels';
import { ErrorBoundary } from './components/ErrorBoundary';
import useSaveShortcut from './hooks/useSaveShortcut';
import { useCallback, useEffect, useRef, useState } from 'react';
import SavedToast from './components/SavedToast';

function App() {
  const { activePath, openPaths } = useFileState();
  const { saveFile } = useFileActions();
  const [saved, setSaved] = useState(false);
  const hideTimer = useRef<number | null>(null);

  const onSave = useCallback(() => {
    if (!activePath) return;
    saveFile(activePath);
    setSaved(true);
    if (hideTimer.current) window.clearTimeout(hideTimer.current);
    hideTimer.current = window.setTimeout(() => setSaved(false), 2000);
  }, [activePath, saveFile]);

  useEffect(
    () => () => {
      if (hideTimer.current) window.clearTimeout(hideTimer.current);
    },
    [],
  );

  useSaveShortcut(Boolean(activePath), onSave);

  return (
    <>
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
          <FileTree />
        </Panel>
        <PanelResizeHandle className="border-l-[0.5px] border-l-neutral-600" />
        <Panel id="code-editor-panel" className="min-h-0" defaultSize={75}>
          {activePath === null && openPaths.length === 0 ? (
            <EmptyEditor />
          ) : (
            <ErrorBoundary resetKey={activePath}>
              <div className="flex flex-col h-full w-full min-h-0">
                <Tabs />
                <Breadcrumbs path={activePath!} />
                <Editor />
              </div>
            </ErrorBoundary>
          )}
        </Panel>
      </PanelGroup>
      <SavedToast show={saved} />
    </>
  );
}

export default App;
