import { PROJECT_SCHEMA_VERSION, type MindMapNode, type Project } from "@/domain/project";
import { textBody } from "@/domain/slide";

export function createProject(title = "Untitled presentation"): Project {
  const now = new Date().toISOString();
  const projectId = crypto.randomUUID();
  const rootId = crypto.randomUUID();
  const root: MindMapNode = {
    id: rootId,
    parentId: null,
    childIds: [],
    position: { x: 320, y: 220 },
    size: { width: 280, height: 158 },
    title: "Start with your main idea",
    slide: {
      layout: "title",
      title: "Start with your main idea",
      body: textBody("Use this first node to frame your presentation."),
      background: { type: "theme" },
      textAlignment: "center",
    },
    isCollapsed: false,
    isHiddenFromPresentation: false,
    createdAt: now,
    updatedAt: now,
  };
  return {
    id: projectId,
    title,
    rootNodeId: rootId,
    nodes: { [rootId]: root },
    presentationOrder: [rootId],
    themeId: "minimal-light",
    createdAt: now,
    updatedAt: now,
    version: PROJECT_SCHEMA_VERSION,
  };
}
