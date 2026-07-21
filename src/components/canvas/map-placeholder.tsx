"use client";

import { ImageIcon, MessageSquareText } from "lucide-react";
import type { MindMapNode, Project } from "@/domain/project";
import { richTextToPlainText } from "@/domain/slide";

type MapPlaceholderProps = { project: Project; selectedId?: string; onSelect: (id: string) => void };

function PreviewCard({ node, order, selected, onSelect }: { node: MindMapNode; order: number; selected: boolean; onSelect: () => void }) {
  return (
    <button className="preview-card" data-selected={selected || undefined} style={{ left: node.position.x, top: node.position.y, width: node.size.width, aspectRatio: "16 / 9" }} onClick={onSelect} type="button">
      <span className="preview-order">{order}</span>
      <span className="preview-kicker">{node.slide.layout.replaceAll("-", " ")}</span>
      <strong>{node.title}</strong>
      <span className="preview-body">{richTextToPlainText(node.slide.body)}</span>
      <span className="preview-meta">
        {node.slide.image && <ImageIcon size={12} aria-label="Contains image" />}
        {node.slide.speakerNotes && <MessageSquareText size={12} aria-label="Contains speaker notes" />}
      </span>
    </button>
  );
}

export function MapPlaceholder({ project, selectedId, onSelect }: MapPlaceholderProps) {
  return (
    <div className="map-viewport">
      <div className="map-grid" aria-label="Mind map canvas">
        <svg className="connector-layer" width="1500" height="1750" aria-hidden="true">
          {Object.values(project.nodes).map((node) => {
            if (!node.parentId) return null;
            const parent = project.nodes[node.parentId];
            if (!parent) return null;
            const x1 = parent.position.x + parent.size.width;
            const y1 = parent.position.y + parent.size.height / 2;
            const x2 = node.position.x;
            const y2 = node.position.y + node.size.height / 2;
            return <path key={node.id} d={`M ${x1} ${y1} C ${x1 + 55} ${y1}, ${x2 - 55} ${y2}, ${x2} ${y2}`} />;
          })}
        </svg>
        {Object.values(project.nodes).map((node) => (
          <PreviewCard key={node.id} node={node} order={project.presentationOrder.indexOf(node.id) + 1} selected={node.id === selectedId} onSelect={() => onSelect(node.id)} />
        ))}
      </div>
    </div>
  );
}
