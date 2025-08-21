import { useEffect } from 'react';
import { useActivePath } from './state/ActiveFileProvider';
import { useFileActions } from './state/ActiveFileProvider';
import Editor from './components/Editor';
import FileTree from './components/FileTree';
import reactTutorialFiles from './data/reactTutorialFiles';
import buildTree from './lib/buildTree';
import normalizePath from './utils/normalizePath';

function App() {
  const activePath = useActivePath();
  const { openFile } = useFileActions();

  useEffect(() => {
    if (!activePath) openFile('app/package.json');
  }, []);

  const getContent = (path: string) => {
    const normPath = normalizePath(path);
    return (
      reactTutorialFiles.find((file) => file.path === normPath)?.content ?? ''
    );
  };

  const rootNode = buildTree(reactTutorialFiles);

  return (
    <div className="grid grid-cols-4">
      <aside className="overflow-auto col-span-1 min-h-0">
        <FileTree rootNode={rootNode} />
      </aside>
      <main className="col-span-3 min-h-0">
        <Editor
          path={activePath || 'app/package.json'}
          getContent={getContent}
        />
      </main>
    </div>
  );
}

export default App;
