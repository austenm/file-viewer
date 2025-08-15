import reactTutorialFiles from './data/reactTutorialFiles';
import buildTree from './lib/buildTree';

function App() {
  console.log(buildTree(reactTutorialFiles));
  return <div className="bg-red-500">tailwind test</div>;
}

export default App;
