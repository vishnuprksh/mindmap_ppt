"use client";

import { ChevronDown, ChevronRight, ImageIcon, MessageSquareText } from "lucide-react";
import { Handle, NodeResizer, Position, type Node, type NodeProps } from "@xyflow/react";
import type { MindMapNode } from "@/domain/project";
import { richTextToPlainText } from "@/domain/slide";

export type SlidePreviewData = Record<string, unknown> & {
  node: MindMapNode;
  order: number;
  editing: boolean;
  onRename: (id: string, title: string) => void;
  onFinishEditing: () => void;
  onToggleCollapsed: (id: string) => void;
  onResize: (id: string, size: { width: number; height: number }, position: { x: number; y: number }) => void;
};

export type SlidePreviewFlowNode = Node<SlidePreviewData, "slidePreview">;

export function SlidePreviewNode({ data, selected }: NodeProps<SlidePreviewFlowNode>) {
  const { node } = data;
  return (
    <div className="flow-preview-card" data-selected={selected || undefined}>
      <NodeResizer
        minWidth={190}
        minHeight={107}
        maxWidth={420}
        maxHeight={236}
        isVisible={selected}
        lineClassName="node-resize-line"
        handleClassName="node-resize-handle"
        onResizeEnd={(_, details) => data.onResize(node.id, { width: details.width, height: details.height }, { x: details.x, y: details.y })}
      />
      <Handle type="target" position={Position.Left} className="node-handle" />
      <Handle type="source" position={Position.Right} className="node-handle" />
      <span className="preview-order">{data.order > 0 ? data.order : "–"}</span>
      <span className="preview-kicker">{node.slide.layout.replaceAll("-", " ")}</span>
      {data.editing ? (
        <input
          className="node-title-input nodrag"
          defaultValue={node.title}
          autoFocus
          onFocus={(event) => event.currentTarget.select()}
          onBlur={(event) => { data.onRename(node.id, event.currentTarget.value); data.onFinishEditing(); }}
          onKeyDown={(event) => {
            if (event.key === "Enter") event.currentTarget.blur();
            if (event.key === "Escape") data.onFinishEditing();
          }}
        />
      ) : <strong>{node.title}</strong>}
      <span className="preview-body">{richTextToPlainText(node.slide.body) || "Add supporting details…"}</span>
      <span className="preview-meta">
        {node.slide.image && <ImageIcon size={12} aria-label="Contains image" />}
        {node.slide.speakerNotes && <MessageSquareText size={12} aria-label="Contains speaker notes" />}
      </span>
      {node.childIds.length > 0 && (
        <button className="collapse-button nodrag" type="button" aria-label={node.isCollapsed ? "Expand branch" : "Collapse branch"} onClick={(event) => { event.stopPropagation(); data.onToggleCollapsed(node.id); }}>
          {node.isCollapsed ? <ChevronRight size={13} /> : <ChevronDown size={13} />}
          <span>{node.childIds.length}</span>
        </button>
      )}
    </div>
  );
}
