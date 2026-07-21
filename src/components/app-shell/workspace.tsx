"use client";

import { useState } from "react";
import { AlignLeft, ChevronLeft, ChevronRight, CircleHelp, Download, ImagePlus, LayoutDashboard, ListTree, Map, Maximize2, MonitorPlay, Moon, MoreHorizontal, PanelLeftClose, PanelRightClose, Plus, Redo2, Route, Save, Sparkles, Undo2 } from "lucide-react";
import { countPresentationSlides } from "@/domain/project";
import { themes } from "@/domain/theme";
import { useProjectPersistence } from "@/hooks/use-project-persistence";
import { useProjectStore } from "@/store/project-store";
import { IconButton } from "@/components/common/icon-button";
import { OutlineTree } from "@/components/outline/outline-tree";
import { MapPlaceholder } from "@/components/canvas/map-placeholder";

export function Workspace() {
  useProjectPersistence();
  const store = useProjectStore();
  const [leftTab, setLeftTab] = useState<"outline" | "order">("outline");
  const selectedId = store.selectedNodeIds[0];
  const selectedNode = selectedId ? store.project.nodes[selectedId] : undefined;
  const theme = themes.find((item) => item.id === store.project.themeId) ?? themes[0];

  return (
    <main className="app" style={{ "--theme-accent": theme.accent } as React.CSSProperties}>
      <header className="topbar">
        <div className="brand"><span className="brand-mark"><Route size={18} /></span><span>Orbit</span></div>
        <span className="toolbar-divider" />
        <input className="project-title" aria-label="Project title" key={store.project.id + store.project.title} defaultValue={store.project.title} onBlur={(event) => store.renameProject(event.target.value)} />
        <div className="toolbar-group">
          <IconButton icon={Undo2} label="Undo" shortcut="Ctrl+Z" disabled={!store.past.length} onClick={store.undo} />
          <IconButton icon={Redo2} label="Redo" shortcut="Ctrl+Shift+Z" disabled={!store.future.length} onClick={store.redo} />
        </div>
        <span className="toolbar-divider" />
        <div className="toolbar-group future-controls" aria-label="Canvas tools coming in Phase 2">
          <IconButton icon={Plus} label="Add node — available in Phase 2" disabled />
          <IconButton icon={ListTree} label="Add child — available in Phase 2" disabled />
          <IconButton icon={ImagePlus} label="Add image — available in Phase 3" disabled />
          <IconButton icon={Sparkles} label="Auto layout — available in Phase 2" disabled />
        </div>
        <div className="mode-switch" aria-label="Workspace mode">
          <button type="button" data-active={store.mode === "map" || undefined} onClick={() => store.setMode("map")}><Map size={15} /> Map</button>
          <button type="button" disabled title="Slide editing arrives in Phase 3"><LayoutDashboard size={15} /> Slide</button>
        </div>
        <div className="toolbar-actions">
          <button className="toolbar-button" type="button" disabled title="Presentation arrives in Phase 4"><MonitorPlay size={16} /> Present</button>
          <IconButton icon={Download} label="Export — available in Phase 5" disabled />
          <div className="save-state" data-status={store.saveStatus}><Save size={14} /> {store.saveStatus === "saving" ? "Saving…" : store.saveStatus === "error" ? "Save failed" : store.saveStatus === "saved" ? "Saved" : "Local"}</div>
          <details className="more-menu"><summary aria-label="More actions"><MoreHorizontal size={18} /></summary><div className="menu-popover"><button type="button" onClick={store.newProject}>New project</button><button type="button" onClick={store.openSampleProject}>Open sample project</button></div></details>
        </div>
      </header>

      <section className="workspace-grid" data-left={store.leftPanelOpen} data-right={store.rightPanelOpen}>
        {store.leftPanelOpen && <aside className="sidebar left-sidebar">
          <div className="panel-tabs"><button type="button" data-active={leftTab === "outline" || undefined} onClick={() => setLeftTab("outline")}>Outline</button><button type="button" data-active={leftTab === "order" || undefined} onClick={() => setLeftTab("order")}>Slide order</button></div>
          {leftTab === "outline" ? <OutlineTree project={store.project} selectedId={selectedId} onSelect={store.selectNode} /> : <ol className="slide-order">{store.project.presentationOrder.map((id, index) => store.project.nodes[id] && <li key={id}><span>{index + 1}</span><button type="button" onClick={() => store.selectNode(id)}>{store.project.nodes[id].title}</button></li>)}</ol>}
          <div className="sidebar-footer"><button type="button" onClick={store.newProject}><Plus size={14} /> New project</button><button type="button" onClick={store.openSampleProject}><Sparkles size={14} /> Example</button></div>
        </aside>}

        <section className="main-workspace">
          <div className="canvas-chrome"><span><span className="live-dot" /> Map foundation</span><span>Canvas interactions arrive in Phase 2</span></div>
          <MapPlaceholder project={store.project} selectedId={selectedId} onSelect={store.selectNode} />
          {!store.leftPanelOpen && <button className="panel-reveal left" type="button" aria-label="Show outline" onClick={store.toggleLeftPanel}><ChevronRight size={16} /></button>}
          {!store.rightPanelOpen && <button className="panel-reveal right" type="button" aria-label="Show properties" onClick={store.toggleRightPanel}><ChevronLeft size={16} /></button>}
        </section>

        {store.rightPanelOpen && <aside className="sidebar right-sidebar">
          <div className="panel-heading"><span>Properties</span><IconButton icon={PanelRightClose} label="Hide properties" onClick={store.toggleRightPanel} /></div>
          {selectedNode ? <div className="properties-form">
            <div className="selection-label"><span className="selection-swatch" /> Slide {store.project.presentationOrder.indexOf(selectedNode.id) + 1}</div>
            <label>Title<input key={selectedNode.id + selectedNode.title} defaultValue={selectedNode.title} onBlur={(event) => store.renameNode(selectedNode.id, event.target.value)} /></label>
            <label>Layout<select value={selectedNode.slide.layout} disabled aria-label="Slide layout"><option>{selectedNode.slide.layout.replaceAll("-", " ")}</option></select></label>
            <div className="property-section"><span>Appearance</span><button type="button" disabled><span className="color-chip" /> Theme background</button><button type="button" disabled><AlignLeft size={15} /> {selectedNode.slide.textAlignment ?? "left"} aligned</button></div>
            <p className="phase-note">Slide layout and appearance controls unlock in Phase 3.</p>
          </div> : <p className="empty-copy">Select a node to view its properties.</p>}
        </aside>}
      </section>

      <footer className="statusbar">
        <button type="button" onClick={store.toggleLeftPanel}><PanelLeftClose size={13} /> {store.leftPanelOpen ? "Hide" : "Show"} outline</button>
        <span>{Object.keys(store.project.nodes).length} nodes</span><span>{countPresentationSlides(store.project)} slides</span><span className="status-mode"><Map size={12} /> Map mode</span>
        <span className="status-spacer" />
        {store.persistenceError && <span className="save-error" title={store.persistenceError}>Local save unavailable</span>}
        <button type="button" disabled title="Keyboard shortcuts arrive in Phase 2"><CircleHelp size={13} /> Shortcuts</button>
        <span>100%</span><IconButton icon={Moon} label="Theme selector — available in Phase 3" disabled /><IconButton icon={Maximize2} label="Fit view — available in Phase 2" disabled />
      </footer>
    </main>
  );
}
