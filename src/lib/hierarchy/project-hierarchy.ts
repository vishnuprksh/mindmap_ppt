import type { MindMapNode, Project } from "@/domain/project";
import { textBody } from "@/domain/slide";

const DEFAULT_SIZE = { width: 240, height: 135 };

export function depthFirstOrder(project: Project): string[] {
  if (!project.rootNodeId || !project.nodes[project.rootNodeId]) return [];
  const order: string[] = [];
  const visit = (id: string) => {
    const node = project.nodes[id];
    if (!node) return;
    order.push(id);
    node.childIds.forEach(visit);
  };
  visit(project.rootNodeId);
  return order;
}

export function descendantIds(project: Project, id: string): string[] {
  const result: string[] = [];
  const visit = (nodeId: string) => {
    project.nodes[nodeId]?.childIds.forEach((childId) => {
      result.push(childId);
      visit(childId);
    });
  };
  visit(id);
  return result;
}

export function visibleNodeIds(project: Project): string[] {
  if (!project.rootNodeId) return [];
  const visible: string[] = [];
  const visit = (id: string) => {
    const node = project.nodes[id];
    if (!node) return;
    visible.push(id);
    if (!node.isCollapsed) node.childIds.forEach(visit);
  };
  visit(project.rootNodeId);
  return visible;
}

export function canReparent(project: Project, id: string, parentId: string | null): boolean {
  if (!project.nodes[id] || (parentId && !project.nodes[parentId])) return false;
  return parentId !== id && !descendantIds(project, id).includes(parentId ?? "");
}

export function reparentNode(project: Project, id: string, parentId: string | null): Project {
  const node = project.nodes[id];
  if (!node || node.parentId === parentId || !canReparent(project, id, parentId)) return project;
  if (parentId === null && project.rootNodeId && project.rootNodeId !== id) return project;
  const nodes = { ...project.nodes };
  if (node.parentId) {
    const oldParent = nodes[node.parentId];
    nodes[node.parentId] = { ...oldParent, childIds: oldParent.childIds.filter((childId) => childId !== id) };
  }
  if (parentId) {
    const parent = nodes[parentId];
    nodes[parentId] = { ...parent, childIds: [...parent.childIds, id] };
  }
  nodes[id] = { ...node, parentId, updatedAt: new Date().toISOString() };
  return { ...project, nodes };
}

export function createNode(project: Project, parentId: string, title = "New idea"): { project: Project; id: string } {
  const parent = project.nodes[parentId];
  if (!parent) return { project, id: parentId };
  const now = new Date().toISOString();
  const id = crypto.randomUUID();
  const siblingIndex = parent.childIds.length;
  const node: MindMapNode = {
    id,
    parentId,
    childIds: [],
    position: { x: parent.position.x + parent.size.width + 100, y: parent.position.y + siblingIndex * 165 },
    size: DEFAULT_SIZE,
    title,
    slide: { layout: "title-bullets", title, body: textBody(""), background: { type: "theme" }, textAlignment: "left" },
    isCollapsed: false,
    isHiddenFromPresentation: false,
    createdAt: now,
    updatedAt: now,
  };
  const nodes = {
    ...project.nodes,
    [parentId]: { ...parent, childIds: [...parent.childIds, id], isCollapsed: false, updatedAt: now },
    [id]: node,
  };
  const next = { ...project, nodes };
  return { project: { ...next, presentationOrder: depthFirstOrder(next) }, id };
}

export function deleteNodes(project: Project, ids: string[]): Project {
  const removed = new Set(ids.flatMap((id) => [id, ...descendantIds(project, id)]));
  const nodes = Object.fromEntries(Object.entries(project.nodes)
    .filter(([id]) => !removed.has(id))
    .map(([id, node]) => [id, { ...node, childIds: node.childIds.filter((childId) => !removed.has(childId)) }]));
  const rootNodeId = project.rootNodeId && removed.has(project.rootNodeId) ? null : project.rootNodeId;
  const next = { ...project, rootNodeId, nodes, presentationOrder: project.presentationOrder.filter((id) => !removed.has(id)) };
  return next;
}

export function duplicateBranch(project: Project, sourceId: string, parentId?: string | null): { project: Project; id: string } {
  const source = project.nodes[sourceId];
  const destinationParentId = parentId === undefined ? source?.parentId : parentId;
  if (!source || !destinationParentId || !project.nodes[destinationParentId]) return { project, id: sourceId };
  const nodes = { ...project.nodes };
  const now = new Date().toISOString();
  const copy = (oldId: string, newParentId: string): string => {
    const original = project.nodes[oldId];
    const id = crypto.randomUUID();
    const childIds = original.childIds.map((childId) => copy(childId, id));
    nodes[id] = {
      ...structuredClone(original), id, parentId: newParentId, childIds,
      position: { x: original.position.x + 36, y: original.position.y + 36 },
      title: oldId === sourceId ? `${original.title} copy` : original.title,
      slide: { ...structuredClone(original.slide), title: oldId === sourceId ? `${original.title} copy` : original.slide.title },
      createdAt: now, updatedAt: now,
    };
    return id;
  };
  const id = copy(sourceId, destinationParentId);
  const parent = nodes[destinationParentId];
  nodes[destinationParentId] = { ...parent, childIds: [...parent.childIds, id], isCollapsed: false };
  const next = { ...project, nodes };
  return { project: { ...next, presentationOrder: depthFirstOrder(next) }, id };
}
