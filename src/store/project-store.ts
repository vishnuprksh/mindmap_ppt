"use client";

import { create } from "zustand";
import type { Project, SaveStatus, WorkspaceMode } from "@/domain/project";
import { cloneSampleProject } from "@/features/projects/sample-project";
import { createProject } from "@/features/projects/project-factory";
import { loadLastProject } from "@/lib/persistence/project-database";
import { calculateLayout, type LayoutDirection } from "@/lib/layout/mind-map-layout";
import { createNode, deleteNodes, duplicateBranch, reparentNode } from "@/lib/hierarchy/project-hierarchy";

type ProjectSnapshot = Project;

type ProjectStore = {
  project: Project;
  selectedNodeIds: string[];
  copiedNodeIds: string[];
  editingNodeId: string | null;
  mode: WorkspaceMode;
  leftPanelOpen: boolean;
  rightPanelOpen: boolean;
  saveStatus: SaveStatus;
  isHydrated: boolean;
  persistenceError: string | null;
  past: ProjectSnapshot[];
  future: ProjectSnapshot[];
  hydrate: () => Promise<void>;
  replaceProject: (project: Project) => void;
  newProject: () => void;
  openSampleProject: () => void;
  selectNode: (id: string, additive?: boolean) => void;
  setSelectedNodes: (ids: string[]) => void;
  beginRenaming: (id: string | null) => void;
  addChild: (parentId?: string) => string | null;
  addSibling: (id?: string) => string | null;
  deleteSelected: () => void;
  duplicateSelected: () => void;
  copySelected: () => void;
  pasteNodes: () => void;
  moveNode: (id: string, position: { x: number; y: number }) => void;
  resizeNode: (id: string, size: { width: number; height: number }, position: { x: number; y: number }) => void;
  reparent: (id: string, parentId: string) => void;
  moveUpLevel: (id?: string) => void;
  toggleCollapsed: (id: string) => void;
  autoLayout: (direction: LayoutDirection) => void;
  renameProject: (title: string) => void;
  renameNode: (id: string, title: string) => void;
  setMode: (mode: WorkspaceMode) => void;
  toggleLeftPanel: () => void;
  toggleRightPanel: () => void;
  setSaveStatus: (status: SaveStatus, error?: string | null) => void;
  undo: () => void;
  redo: () => void;
};

function commit(state: ProjectStore, project: Project) {
  return {
    project: { ...project, updatedAt: new Date().toISOString() },
    past: [...state.past.slice(-49), structuredClone(state.project)],
    future: [],
  };
}

export const useProjectStore = create<ProjectStore>((set) => ({
  project: cloneSampleProject(),
  selectedNodeIds: ["launch"],
  copiedNodeIds: [],
  editingNodeId: null,
  mode: "map",
  leftPanelOpen: true,
  rightPanelOpen: true,
  saveStatus: "idle",
  isHydrated: false,
  persistenceError: null,
  past: [],
  future: [],
  hydrate: async () => {
    try {
      const restored = await loadLastProject();
      if (restored) {
        set({ project: restored, selectedNodeIds: restored.rootNodeId ? [restored.rootNodeId] : [], editingNodeId: null, copiedNodeIds: [] });
      }
    } catch (error) {
      set({ persistenceError: error instanceof Error ? error.message : "Could not open local storage.", saveStatus: "error" });
    } finally {
      set({ isHydrated: true });
    }
  },
  replaceProject: (project) => set({ project, selectedNodeIds: project.rootNodeId ? [project.rootNodeId] : [], editingNodeId: null, copiedNodeIds: [], past: [], future: [] }),
  newProject: () => {
    const project = createProject();
    set({ project, selectedNodeIds: project.rootNodeId ? [project.rootNodeId] : [], editingNodeId: null, copiedNodeIds: [], past: [], future: [], mode: "map" });
  },
  openSampleProject: () => {
    const project = cloneSampleProject();
    set({ project, selectedNodeIds: ["launch"], editingNodeId: null, copiedNodeIds: [], past: [], future: [], mode: "map" });
  },
  selectNode: (id, additive = false) => set((state) => ({ selectedNodeIds: additive
    ? state.selectedNodeIds.includes(id) ? state.selectedNodeIds.filter((selectedId) => selectedId !== id) : [...state.selectedNodeIds, id]
    : [id] })),
  setSelectedNodes: (selectedNodeIds) => set({ selectedNodeIds }),
  beginRenaming: (editingNodeId) => set({ editingNodeId }),
  addChild: (parentId) => {
    let createdId: string | null = null;
    set((state) => {
      const targetId = parentId ?? state.selectedNodeIds[0] ?? state.project.rootNodeId;
      if (!targetId) return state;
      const result = createNode(state.project, targetId);
      if (result.project === state.project) return state;
      createdId = result.id;
      return { ...commit(state, result.project), selectedNodeIds: [result.id], editingNodeId: result.id };
    });
    return createdId;
  },
  addSibling: (id) => {
    let createdId: string | null = null;
    set((state) => {
      const selected = state.project.nodes[id ?? state.selectedNodeIds[0]];
      if (!selected?.parentId) return state;
      const result = createNode(state.project, selected.parentId);
      createdId = result.id;
      return { ...commit(state, result.project), selectedNodeIds: [result.id], editingNodeId: result.id };
    });
    return createdId;
  },
  deleteSelected: () => set((state) => {
    if (!state.selectedNodeIds.length) return state;
    const project = deleteNodes(state.project, state.selectedNodeIds);
    if (project === state.project) return state;
    const fallback = state.selectedNodeIds.map((id) => state.project.nodes[id]?.parentId).find((id) => id && project.nodes[id]);
    return { ...commit(state, project), selectedNodeIds: fallback ? [fallback] : project.rootNodeId ? [project.rootNodeId] : [] };
  }),
  duplicateSelected: () => set((state) => {
    const id = state.selectedNodeIds[0];
    if (!id) return state;
    const result = duplicateBranch(state.project, id);
    if (result.project === state.project) return state;
    return { ...commit(state, result.project), selectedNodeIds: [result.id] };
  }),
  copySelected: () => set((state) => ({ copiedNodeIds: [...state.selectedNodeIds] })),
  pasteNodes: () => set((state) => {
    if (!state.copiedNodeIds.length) return state;
    let project = state.project;
    const newIds: string[] = [];
    const targetId = state.selectedNodeIds[0];
    for (const sourceId of state.copiedNodeIds) {
      if (!project.nodes[sourceId]) continue;
      const result = duplicateBranch(project, sourceId, targetId && targetId !== sourceId ? targetId : undefined);
      project = result.project;
      if (result.id !== sourceId) newIds.push(result.id);
    }
    return project === state.project ? state : { ...commit(state, project), selectedNodeIds: newIds };
  }),
  moveNode: (id, position) => set((state) => {
    const node = state.project.nodes[id];
    if (!node || (node.position.x === position.x && node.position.y === position.y)) return state;
    return commit(state, { ...state.project, nodes: { ...state.project.nodes, [id]: { ...node, position } } });
  }),
  resizeNode: (id, size, position) => set((state) => {
    const node = state.project.nodes[id];
    if (!node) return state;
    return commit(state, { ...state.project, nodes: { ...state.project.nodes, [id]: { ...node, size, position } } });
  }),
  reparent: (id, parentId) => set((state) => {
    const project = reparentNode(state.project, id, parentId);
    return project === state.project ? state : commit(state, project);
  }),
  moveUpLevel: (id) => set((state) => {
    const node = state.project.nodes[id ?? state.selectedNodeIds[0]];
    const grandparentId = node?.parentId ? state.project.nodes[node.parentId]?.parentId : null;
    if (!node || !grandparentId) return state;
    const project = reparentNode(state.project, node.id, grandparentId);
    return project === state.project ? state : commit(state, project);
  }),
  toggleCollapsed: (id) => set((state) => {
    const node = state.project.nodes[id];
    if (!node?.childIds.length) return state;
    return commit(state, { ...state.project, nodes: { ...state.project.nodes, [id]: { ...node, isCollapsed: !node.isCollapsed } } });
  }),
  autoLayout: (direction) => set((state) => {
    const positions = calculateLayout(state.project, direction);
    return commit(state, { ...state.project, nodes: Object.fromEntries(Object.entries(state.project.nodes).map(([id, node]) => [id, { ...node, position: positions[id] ?? node.position }])) });
  }),
  renameProject: (title) => set((state) => commit(state, { ...state.project, title: title.trim() || "Untitled presentation" })),
  renameNode: (id, title) => set((state) => {
    const node = state.project.nodes[id];
    if (!node) return state;
    const nextTitle = title.trim() || "Untitled slide";
    return commit(state, {
      ...state.project,
      nodes: { ...state.project.nodes, [id]: { ...node, title: nextTitle, slide: { ...node.slide, title: nextTitle }, updatedAt: new Date().toISOString() } },
    });
  }),
  setMode: (mode) => set({ mode }),
  toggleLeftPanel: () => set((state) => ({ leftPanelOpen: !state.leftPanelOpen })),
  toggleRightPanel: () => set((state) => ({ rightPanelOpen: !state.rightPanelOpen })),
  setSaveStatus: (saveStatus, persistenceError = null) => set({ saveStatus, persistenceError }),
  undo: () => set((state) => {
    const previous = state.past.at(-1);
    if (!previous) return state;
    return { project: previous, past: state.past.slice(0, -1), future: [structuredClone(state.project), ...state.future] };
  }),
  redo: () => set((state) => {
    const next = state.future[0];
    if (!next) return state;
    return { project: next, past: [...state.past, structuredClone(state.project)], future: state.future.slice(1) };
  }),
}));
