import FileTree from './components/FileTree';
import reactTutorialFiles from './data/reactTutorialFiles';
import buildTree from './lib/buildTree';

function App() {
  const rootNode = buildTree(reactTutorialFiles);
  return <FileTree rootNode={rootNode} />;
}

export default App;
