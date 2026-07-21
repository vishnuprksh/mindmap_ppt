"use client";

import { create } from "zustand";
import type { Project, SaveStatus, WorkspaceMode } from "@/domain/project";
import { cloneSampleProject } from "@/features/projects/sample-project";
import { createProject } from "@/features/projects/project-factory";
import { loadLastProject } from "@/lib/persistence/project-database";

type ProjectSnapshot = Project;

type ProjectStore = {
  project: Project;
  selectedNodeIds: string[];
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
  selectNode: (id: string) => void;
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
        set({ project: restored, selectedNodeIds: restored.rootNodeId ? [restored.rootNodeId] : [] });
      }
    } catch (error) {
      set({ persistenceError: error instanceof Error ? error.message : "Could not open local storage.", saveStatus: "error" });
    } finally {
      set({ isHydrated: true });
    }
  },
  replaceProject: (project) => set({ project, selectedNodeIds: project.rootNodeId ? [project.rootNodeId] : [], past: [], future: [] }),
  newProject: () => {
    const project = createProject();
    set({ project, selectedNodeIds: project.rootNodeId ? [project.rootNodeId] : [], past: [], future: [], mode: "map" });
  },
  openSampleProject: () => {
    const project = cloneSampleProject();
    set({ project, selectedNodeIds: ["launch"], past: [], future: [], mode: "map" });
  },
  selectNode: (id) => set({ selectedNodeIds: [id] }),
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
