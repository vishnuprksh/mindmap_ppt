import type { SlideContent } from "./slide";

export const PROJECT_SCHEMA_VERSION = 1;

export type NodePosition = { x: number; y: number };
export type NodeSize = { width: number; height: number };

export type MindMapNode = {
  id: string;
  parentId: string | null;
  childIds: string[];
  position: NodePosition;
  size: NodeSize;
  title: string;
  slide: SlideContent;
  isCollapsed: boolean;
  isHiddenFromPresentation: boolean;
  createdAt: string;
  updatedAt: string;
};

export type Project = {
  id: string;
  title: string;
  description?: string;
  rootNodeId: string | null;
  nodes: Record<string, MindMapNode>;
  presentationOrder: string[];
  themeId: string;
  createdAt: string;
  updatedAt: string;
  version: number;
};

export type SaveStatus = "idle" | "saving" | "saved" | "error";
export type WorkspaceMode = "map" | "slide";

export function countPresentationSlides(project: Project): number {
  return project.presentationOrder.filter(
    (id) => project.nodes[id] && !project.nodes[id].isHiddenFromPresentation,
  ).length;
}
