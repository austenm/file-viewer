export default [
  {
    path: 'app/package.json',
    content: `{
  "name": "demo-project",
  "private": true,
  "version": "0.0.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "tsc -b && vite build",
    "lint": "eslint .",
    "preview": "vite preview"
  },
  "dependencies": {
    "@tailwindcss/vite": "^4.1.12",
    "react": "^19.1.1",
    "react-dom": "^19.1.1",
    "tailwindcss": "^4.1.12"
  },
  "devDependencies": {
    "@eslint/js": "^9.33.0",
    "@types/react": "^19.1.10",
    "@types/react-dom": "^19.1.7",
    "@typescript-eslint/eslint-plugin": "^8.39.1",
    "@typescript-eslint/parser": "^8.39.1",
    "@vitejs/plugin-react-swc": "^4.0.0",
    "eslint": "^9.33.0",
    "eslint-config-prettier": "^10.1.8",
    "eslint-plugin-prettier": "^5.5.4",
    "eslint-plugin-react": "^7.37.5",
    "eslint-plugin-react-hooks": "^5.2.0",
    "eslint-plugin-react-refresh": "^0.4.20",
    "globals": "^16.3.0",
    "prettier": "^3.6.2",
    "typescript": "~5.8.3",
    "typescript-eslint": "^8.39.1",
    "vite": "^7.1.2"
  }
}
`,
  },
  {
    path: 'app/vite.config.ts',
    content: `import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react-swc';
import tailwindcss from '@tailwindcss/vite';

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
});
`,
  },
  {
    path: 'app/index.html',
    content: `<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
    <link href="/src/globals.css" rel="stylesheet" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Demo Project</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>
`,
  },
  {
    path: 'app/src/main.tsx',
    content: `import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './globals.css';
import App from './App.tsx';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
`,
  },
  {
    path: 'app/src/App.tsx',
    content: `import Button from './components/Button';
import Header from './components/Header';

function App() {
  return (
    <div>
      <Header>My demo app</Header>
      <Button>Press me</Button>
    </div>
  );
}

export default App;
`,
  },
  {
    path: 'app/src/components/Button.tsx',
    content: `import React from 'react';
    
const Button = ({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) => {
  const handleClick = () => {
    console.log('button clicked');
  };

  return (
    <button
      onClick={handleClick}
      className={className}
      role="button"
    >
      {children}
    </button>
  );
};

export default Button;

`,
  },
  {
    path: 'app/src/components/Header.tsx',
    content: `import React from 'react';
    
export enum HeaderLevel {
  h1 = 'h1',
  h2 = 'h2',
  h3 = 'h3',
  h4 = 'h4',
  h5 = 'h5',
  h6 = 'h6',
}

const Header = ({
  children,
  level,
  className,
}: {
  children: React.ReactNode;
  level: HeaderLevel;
  className?: string;
}) => {
  const HeaderTag = level;

  return <HeaderTag className={className}>{children}</HeaderTag>;
};

export default Header;
`,
  },
  {
    path: 'app/src/styles/global.css',
    content: `@import 'tailwindcss';
    `,
  },
  {
    path: 'app/public/favicon.svg',
    content: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="#34eb58" 
stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
<path d="M20 10a1 1 0 0 0 1-1V6a1 1 0 0 0-1-1h-2.5a1 1 0 0 1-.8-.4l-.9-1.2A1 1 0 0 0 15 3h-2a1 1 0 0 0-1 1v5a1 1 0 0 0 1 1Z"/>
<path d="M20 21a1 1 0 0 0 1-1v-3a1 1 0 0 0-1-1h-2.9a1 1 0 0 1-.88-.55l-.42-.85a1 1 0 0 0-.92-.6H13a1 1 0 0 0-1 1v5a1 1 0 0 0 1 1Z"/>
<path d="M3 5a2 2 0 0 0 2 2h3"/><path d="M3 3v13a2 2 0 0 0 2 2h3"/></svg>`,
  },
  {
    path: 'app/README.md',
    content: `# file-viewer (VS-style)

A small file viewer inspired by the CoderPad “File Tree” prompt, with a modern stack and nicer UX.

## Stack

- **React + TypeScript** (functional components, Context for state)
- **Vite + SWC** (fast dev/build)
- **Tailwind CSS** (utility-first styling)
- **Monaco Editor** (syntax highlighting)
- **SETI Icons** for file/folder theming
- **react-resizable-panels** for adjustable layout

## Features

- Recursive **file tree** from flat paths → tree (no prop drilling)
- **Active file** managed via Context \`activePath\`
- **Read-only editor** with Monaco (syntax-highlight focus)
- **Resizable** explorer/editor panels
- Familiar **SETI** file type icons

## Getting started

\`\`\` bash
# prerequisites: Node 18+; pnpm (or npm/yarn)
pnpm i
pnpm dev          # start vite dev server
pnpm build        # production build
pnpm preview      # preview the build
\`\`\`

## Project Structure

\`\`\` bash
src/
  components/        # FileTree, Editor, icons, etc.
  data/              # initial files (flat path + content)
  lib/
    buildTree.ts     # flat list -> tree
    monaco/
      setup.ts       # workers + compiler opts
  state/
    ActiveFileProvider.tsx  # activePath + actions
  utils/
    normalizePath.ts          # normalizePath, small pure helpers
\`\`\`

## How it works

- The app starts with a flat list of files (path + content).

- buildTree converts that list into a nested structure for the explorer.

- Clicking a file sets activePath via the Context provider, and the Editor swaps to the corresponding Monaco model.

- Monaco is configured for syntax highlighting; semantic typechecking is intentionally dialed down to keep the demo clean.

Note on Monaco: the worker setup lives in lib/monaco/setup.ts and is imported first in main.tsx. Models use URIs that end with the real filename (e.g. .tsx) so TSX highlights properly.

## Design choices

- Keep state light in Context (just activePath); treat Monaco models as the source of truth for text.

- Prefer pure helpers in utils/ and editor-specific helpers in lib/monaco/.

- SETI icons are used as recommended by the package; the SVG is inserted into a controlled wrapper.

## Roadmap

- [ ] Add / edit / save files (mirror Monaco models → contentStore, optional localStorage)

- [X] Multiple tabs with close/neighbor-select behavior

- [ ] More file types (extend langFromExt)

- [ ] Optional semantic typechecking in Monaco with virtual .d.ts shims
`,
  },
  {
    path: 'app/src/components/folder/another-folder/ComponentWithAReallyLongNameToTestTruncation.tsx',
    content: `import React from 'react';
import Button from './Button';
import Header from './Header';

const Component = ({ callback }: { callback: () => void }) => {
  const handleClick = () => {
    console.log('ok');
    callback();
  }
  return (
    <div>
      <Header>Long name component</Header>
      <Button onClick={handleClick}>Yes, now do callback</Button>
    </div>
  )
}

export default Component;
    `,
  },
];
