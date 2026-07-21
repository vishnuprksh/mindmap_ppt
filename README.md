# Orbit — mind map presentations

Orbit is a local-first workspace for turning a mind map into a presentation. Phase 1 establishes the application shell, strict domain model, shared state, sample project, and IndexedDB persistence.

## Setup

Requires Node.js 20.9 or newer.

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). No account, API key, or external service is required.

## Commands

```bash
npm run dev        # development server
npm run build      # production build
npm run lint       # ESLint
npm run typecheck  # strict TypeScript check
npm test           # unit tests
```

## Phase 1 architecture

- `src/domain` contains normalized, UI-independent project, node, slide, and theme types.
- `src/store/project-store.ts` owns persistent project state separately from selection, workspace mode, panels, save status, and history.
- `src/lib/validation` validates data crossing the persistence boundary and provides a future migration seam through `version`.
- `src/lib/persistence` isolates IndexedDB access. Projects are stored in a project object store; image blobs have a separate store so project JSON stays small.
- `src/features/projects` contains the project factory and the preloaded “Product Launch Plan” example.
- `src/components` contains the application shell, outline, and read-only Phase 1 map preview.

Meaningful project changes autosave after a 650 ms debounce. The most recently opened project ID is the only project preference kept in `localStorage`; full projects live in IndexedDB.

## Data model

A `Project` owns a normalized `Record<string, MindMapNode>`. Nodes keep hierarchy (`parentId` and `childIds`) separate from canvas `position`. Each node owns structured `SlideContent`, and `presentationOrder` is independent of hierarchy. External project values are validated before they enter IndexedDB.

## Keyboard shortcuts

The Phase 1 UI exposes undo and redo. The complete map workflow—Enter for siblings, Tab for children, F2 rename, clipboard operations, navigation, and presentation shortcuts—is scheduled for Phase 2 and later as described in [plan.md](./plan.md).

## Current limitations

Phase 1 intentionally does not include interactive React Flow editing, the rich slide editor, presentation playback, image management UI, or PowerPoint export. Controls for later phases are visibly disabled rather than presenting non-functional actions. PowerPoint export limitations will be documented when export is implemented in Phase 5.
