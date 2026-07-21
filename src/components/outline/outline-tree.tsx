"use client";

import { ChevronDown, FileText } from "lucide-react";
import type { MindMapNode, Project } from "@/domain/project";

type OutlineTreeProps = { project: Project; selectedId?: string; onSelect: (id: string) => void };

function OutlineItem({ node, project, selectedId, onSelect, depth }: { node: MindMapNode; project: Project; selectedId?: string; onSelect: (id: string) => void; depth: number }) {
  return (
    <li>
      <button className="outline-item" data-selected={node.id === selectedId || undefined} style={{ paddingLeft: `${12 + depth * 17}px` }} onClick={() => onSelect(node.id)} type="button">
        {node.childIds.length > 0 ? <ChevronDown size={13} aria-hidden="true" /> : <span className="outline-spacer" />}
        <FileText size={14} aria-hidden="true" />
        <span>{node.title}</span>
      </button>
      {node.childIds.length > 0 && !node.isCollapsed && (
        <ul>{node.childIds.map((id) => project.nodes[id] && <OutlineItem key={id} node={project.nodes[id]} project={project} selectedId={selectedId} onSelect={onSelect} depth={depth + 1} />)}</ul>
      )}
    </li>
  );
}

export function OutlineTree({ project, selectedId, onSelect }: OutlineTreeProps) {
  const root = project.rootNodeId ? project.nodes[project.rootNodeId] : null;
  return root ? <ul className="outline-tree"><OutlineItem node={root} project={project} selectedId={selectedId} onSelect={onSelect} depth={0} /></ul> : <p className="empty-copy">No ideas yet.</p>;
}
