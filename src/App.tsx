import firstTestData from './data/firstTestData';
import buildTree from './lib/buildTree';

function App() {
  console.log(buildTree(firstTestData));
  return <div className="bg-red-500">tailwind test</div>;
}

export default App;
