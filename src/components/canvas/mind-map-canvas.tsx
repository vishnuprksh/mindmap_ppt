"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  applyNodeChanges,
  Background,
  BackgroundVariant,
  ConnectionMode,
  Controls,
  MiniMap,
  ReactFlow,
  ReactFlowProvider,
  useReactFlow,
  type Connection,
  type Edge,
  type NodeChange,
  type OnSelectionChangeParams,
} from "@xyflow/react";
import { visibleNodeIds } from "@/lib/hierarchy/project-hierarchy";
import { useProjectStore } from "@/store/project-store";
import { SlidePreviewNode, type SlidePreviewFlowNode } from "@/components/nodes/slide-preview-node";

const nodeTypes = { slidePreview: SlidePreviewNode };
type ProjectState = ReturnType<typeof useProjectStore.getState>;

function createFlowNodes(state: ProjectState): SlidePreviewFlowNode[] {
  return visibleNodeIds(state.project).map((id) => {
    const node = state.project.nodes[id];
    return {
      id,
      type: "slidePreview",
      position: node.position,
      width: node.size.width,
      height: node.size.height,
      selected: state.selectedNodeIds.includes(id),
      data: {
        node,
        order: state.project.presentationOrder.indexOf(id) + 1,
        editing: state.editingNodeId === id,
        onRename: state.renameNode,
        onFinishEditing: () => useProjectStore.getState().beginRenaming(null),
        onToggleCollapsed: state.toggleCollapsed,
        onResize: state.resizeNode,
      },
    };
  });
}

function isTextEntry(target: EventTarget | null): boolean {
  return target instanceof HTMLElement && (target.isContentEditable || ["INPUT", "TEXTAREA", "SELECT"].includes(target.tagName));
}

function CanvasContent() {
  const store = useProjectStore();
  const { fitView, zoomIn, zoomOut } = useReactFlow();
  const visibleIds = useMemo(() => visibleNodeIds(store.project), [store.project]);
  const visible = useMemo(() => new Set(visibleIds), [visibleIds]);
  const [nodes, setNodes] = useState(() => createFlowNodes(store));
  useEffect(() => useProjectStore.subscribe((state, previous) => {
    if (state.project !== previous.project || state.selectedNodeIds !== previous.selectedNodeIds || state.editingNodeId !== previous.editingNodeId) {
      setNodes(createFlowNodes(state));
    }
  }), []);

  const edges = useMemo<Edge[]>(() => Object.values(store.project.nodes).flatMap((node) => node.parentId && visible.has(node.id) && visible.has(node.parentId) ? [{
    id: `${node.parentId}-${node.id}`,
    source: node.parentId,
    target: node.id,
    type: "bezier",
  }] : []), [store.project.nodes, visible]);

  const onNodesChange = useCallback((changes: NodeChange<SlidePreviewFlowNode>[]) => setNodes((current) => applyNodeChanges(changes, current)), []);
  const onSelectionChange = useCallback(({ nodes: selected }: OnSelectionChangeParams<SlidePreviewFlowNode>) => {
    const ids = selected.map((node) => node.id);
    if (ids.join() !== useProjectStore.getState().selectedNodeIds.join()) useProjectStore.getState().setSelectedNodes(ids);
  }, []);
  const onConnect = useCallback((connection: Connection) => {
    if (connection.source !== connection.target) useProjectStore.getState().reparent(connection.target, connection.source);
  }, []);

  const selectNearby = useCallback((key: string) => {
    const state = useProjectStore.getState();
    const current = state.project.nodes[state.selectedNodeIds[0]];
    if (!current) return;
    const center = { x: current.position.x + current.size.width / 2, y: current.position.y + current.size.height / 2 };
    const candidates = visibleIds.map((id) => state.project.nodes[id]).filter((node) => node.id !== current.id).map((node) => {
      const x = node.position.x + node.size.width / 2 - center.x;
      const y = node.position.y + node.size.height / 2 - center.y;
      const valid = key === "ArrowRight" ? x > 0 && Math.abs(y) < Math.abs(x) * 2 : key === "ArrowLeft" ? x < 0 && Math.abs(y) < Math.abs(x) * 2 : key === "ArrowDown" ? y > 0 && Math.abs(x) < Math.abs(y) * 2 : y < 0 && Math.abs(x) < Math.abs(y) * 2;
      return { node, distance: valid ? Math.hypot(x, y) : Infinity };
    }).sort((a, b) => a.distance - b.distance);
    if (Number.isFinite(candidates[0]?.distance)) state.selectNode(candidates[0].node.id);
  }, [visibleIds]);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (isTextEntry(event.target)) return;
      const state = useProjectStore.getState();
      const id = state.selectedNodeIds[0];
      const modifier = event.ctrlKey || event.metaKey;
      if (modifier && event.key.toLowerCase() === "z") { event.preventDefault(); if (event.shiftKey) state.redo(); else state.undo(); return; }
      if (modifier && event.key.toLowerCase() === "d") { event.preventDefault(); state.duplicateSelected(); return; }
      if (modifier && event.key.toLowerCase() === "c") { event.preventDefault(); state.copySelected(); return; }
      if (modifier && event.key.toLowerCase() === "v") { event.preventDefault(); state.pasteNodes(); return; }
      if (event.key === "Tab") { event.preventDefault(); if (event.shiftKey) state.moveUpLevel(id); else state.addChild(id); return; }
      if (event.key === "Enter" && !modifier) { event.preventDefault(); state.addSibling(id); return; }
      if ((event.key === "Delete" || event.key === "Backspace") && id) { event.preventDefault(); state.deleteSelected(); return; }
      if (event.key === "F2" && id) { event.preventDefault(); state.beginRenaming(id); return; }
      if (event.key.startsWith("Arrow")) { event.preventDefault(); selectNearby(event.key); return; }
      if (event.key === "+" || event.key === "=") { event.preventDefault(); void zoomIn(); return; }
      if (event.key === "-") { event.preventDefault(); void zoomOut(); }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [selectNearby, zoomIn, zoomOut]);

  useEffect(() => {
    const handleFit = () => { void fitView({ padding: 0.18, duration: 350 }); };
    window.addEventListener("mindmap:fit", handleFit);
    return () => window.removeEventListener("mindmap:fit", handleFit);
  }, [fitView]);

  return (
    <ReactFlow<SlidePreviewFlowNode, Edge>
      nodes={nodes}
      edges={edges}
      nodeTypes={nodeTypes}
      onNodesChange={onNodesChange}
      onNodeDragStop={(_, node) => store.moveNode(node.id, node.position)}
      onSelectionChange={onSelectionChange}
      onNodeDoubleClick={(_, node) => store.beginRenaming(node.id)}
      onConnect={onConnect}
      connectionMode={ConnectionMode.Loose}
      selectionOnDrag
      panOnDrag={[1, 2]}
      panActivationKeyCode="Space"
      multiSelectionKeyCode={["Meta", "Control"]}
      deleteKeyCode={null}
      minZoom={0.25}
      maxZoom={2}
      fitView
      fitViewOptions={{ padding: 0.18 }}
      proOptions={{ hideAttribution: true }}
      aria-label="Mind map canvas"
    >
      <Background variant={BackgroundVariant.Dots} gap={20} size={1.2} color="#d3d6dc" />
      <Controls showInteractive={false} onFitView={() => fitView({ padding: 0.18, duration: 350 })} />
      <MiniMap pannable zoomable nodeColor="#ffffff" nodeStrokeColor="#6d5dfc" maskColor="rgba(244,245,247,.72)" />
    </ReactFlow>
  );
}

export function MindMapCanvas() {
  return <div className="map-viewport"><ReactFlowProvider><CanvasContent /></ReactFlowProvider></div>;
}
