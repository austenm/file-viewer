# file-viewer (VS-style)

A small file viewer inspired by the CoderPad “File Tree” prompt, with a modern stack and nicer UX.

## Demo

> [](https://media4.giphy.com/media/v1.Y2lkPTc5MGI3NjExeTk4dmM0cmtwZXJleXZ4bm5qN2l5ZmN6Y3U4Nm5nYm1nODhkdXV3ciZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/IxIVBjD6c2neTazyXz/giphy.gif)  
> [Link to live example](https://file-viewer-topaz.vercel.app/)

## Stack

- **React + TypeScript** (functional components, Context for state)
- **Vite + SWC** (fast dev/build)
- **Tailwind CSS** (utility-first styling)
- **Monaco Editor** (syntax highlighting)
- **SETI Icons** for file/folder theming
- **react-resizable-panels** for adjustable layout

## Features

- Recursive **file tree** from flat paths → tree (no prop drilling)
- **Active file** managed via Context (`activePath`)
- **Read-only editor** with Monaco (syntax-highlight focus)
- **Resizable** explorer/editor panels
- Familiar **SETI** file type icons

## Getting started

```bash
# prerequisites: Node 18+; pnpm (or npm/yarn)
pnpm i
pnpm dev          # start vite dev server
pnpm build        # production build
pnpm preview      # preview the build
```

## Project Structure

```bash
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
```

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

- [ ] Multiple tabs with close/neighbor-select behavior

- [ ] More file types (extend langFromExt)

- [ ] Optional semantic typechecking in Monaco with virtual .d.ts shims
