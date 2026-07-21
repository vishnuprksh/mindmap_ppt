import dagre from "@dagrejs/dagre";
import type { NodePosition, Project } from "@/domain/project";

export type LayoutDirection = "horizontal" | "vertical" | "radial";

export function calculateLayout(project: Project, direction: LayoutDirection): Record<string, NodePosition> {
  if (direction === "radial") return radialLayout(project);
  const graph = new dagre.graphlib.Graph();
  graph.setDefaultEdgeLabel(() => ({}));
  graph.setGraph({ rankdir: direction === "horizontal" ? "LR" : "TB", ranksep: 100, nodesep: 42, marginx: 60, marginy: 60 });
  Object.values(project.nodes).forEach((node) => graph.setNode(node.id, node.size));
  Object.values(project.nodes).forEach((node) => node.childIds.forEach((childId) => graph.setEdge(node.id, childId)));
  dagre.layout(graph);
  return Object.fromEntries(Object.values(project.nodes).map((node) => {
    const point = graph.node(node.id);
    return [node.id, { x: point.x - node.size.width / 2, y: point.y - node.size.height / 2 }];
  }));
}

function radialLayout(project: Project): Record<string, NodePosition> {
  const positions: Record<string, NodePosition> = {};
  if (!project.rootNodeId) return positions;
  const levels: string[][] = [];
  const queue: Array<[string, number]> = [[project.rootNodeId, 0]];
  while (queue.length) {
    const [id, depth] = queue.shift()!;
    (levels[depth] ??= []).push(id);
    project.nodes[id]?.childIds.forEach((childId) => queue.push([childId, depth + 1]));
  }
  const center = { x: 650, y: 500 };
  levels.forEach((ids, depth) => ids.forEach((id, index) => {
    const node = project.nodes[id];
    const angle = ids.length === 1 ? -Math.PI / 2 : (index / ids.length) * Math.PI * 2 - Math.PI / 2;
    const radius = depth * 330;
    positions[id] = { x: center.x + Math.cos(angle) * radius - node.size.width / 2, y: center.y + Math.sin(angle) * radius - node.size.height / 2 };
  }));
  return positions;
}
