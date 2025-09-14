# File Viewer (React + Monaco)

A lightweight VS Code-style file viewer/editor with tabs, a keyboard-driven file tree, and local persistence

## Demo

> ![](https://media3.giphy.com/media/v1.Y2lkPTc5MGI3NjExa2FvdDJsaWoxNHkxc3kxN2gwY3hicmVhNHlmd3g2Z3c0MnVjaXd3diZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/Sk76dkSA0FIoVhZDyO/giphy.gif)  
> [Link to live example](https://file-viewer-topaz.vercel.app/)

## 🥞 Stack

- **React + TypeScript** (functional components, Context for state)
- **Vite + SWC** (fast dev/build)
- **Tailwind CSS** (utility-first styling)
- **Monaco Editor** (syntax highlighting)
- **SETI Icons** for file/folder theming
- **react-resizable-panels** for adjustable layout

## ✨ Features
- Monaco editor (dark theme), per-file models with ref-counting
- Dirty indicators + Save (⌘/Ctrl+S), toast, and `beforeunload` safety
- Context menu: New File / New Folder / Rename / Delete
- File tree derived from a store snapshot; empty folders supported
- Local persistence via `localStorage` (`fv:files:v1`)
- Accessible tree navigation (Arrow keys, Home/End, Space/Enter, Shift+F10)

## 🏗️ Architecture
- **contentStore**: `byPath: Map<string,string>`, `folders: Set<string>` (canonical, no trailing `/`), emits a sorted `pathsSnapshot` (folders gain `/` *only* when emitted). Batched ops: `deleteTree`, `renameFolder`.
- **useFilesList**: `useSyncExternalStore` subscriber to `pathsSnapshot`.
- **buildTree**: treats any path ending with `/` as an explicit, possibly empty folder.
- **ActiveFileProvider**: app state (active/open/expanded, `dirtyByPath`, drafts for new file/folder/rename), actions (create/rename/delete, save, guards). Uses refs to avoid stale closures.
- **Editor**: Monaco instance; models acquired/released via a small registry; resize observer.

## 🚀 Getting started

```bash
# prerequisites: Node 18+; pnpm (or npm/yarn)
pnpm i            # or npm i / yarn
pnpm dev          # start vite dev server
pnpm test         # run unit tests (vitest + RTL)
pnpm build        # production build
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

## 🖱️ Keyboard & UI

- Tree: ↑/↓ move, → expand/into first child, ← collapse/up, Home/End start/end, Space/Enter toggle/open
- Context Menu: Right-click or Shift+F10, Esc to close
- Save: ⌘/Ctrl+S (blocked in inputs), shows “Saved” toast
- Tabs: close button, dirty dot (unsaved)

## 💾 Persistence

State is saved to localStorage under the key fv:files:v1 (debounced). On first load, demo files seed the store.

## 🧪 Testing

- Unit tests for the store, hooks, and provider
- RTL tests for the tree, context menu, and inline editors
- Monaco + ResizeObserver are mocked in tests

## ⚠️ Limitations / Roadmap

- No backend; persistence is local only
- Single editor pane (no split view)
- Monaco language services are minimal for now
- Future: multi-window, rename validations for complex cases, import/export, basic search

## 📄 License

MIT
