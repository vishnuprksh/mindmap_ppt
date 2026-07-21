import { describe, expect, it } from "vitest";
import { cloneSampleProject } from "@/features/projects/sample-project";
import { calculateLayout } from "@/lib/layout/mind-map-layout";
import { canReparent, createNode, deleteNodes, depthFirstOrder, reparentNode, visibleNodeIds } from "@/lib/hierarchy/project-hierarchy";

describe("mind-map hierarchy", () => {
  it("creates a child and updates depth-first presentation order", () => {
    const source = cloneSampleProject();
    const result = createNode(source, "problem", "New evidence");
    expect(result.project.nodes.problem.childIds.at(-1)).toBe(result.id);
    expect(result.project.nodes[result.id].parentId).toBe("problem");
    expect(depthFirstOrder(result.project).indexOf(result.id)).toBeGreaterThan(depthFirstOrder(result.project).indexOf("problem"));
  });

  it("deletes a complete branch without leaving dangling slide ids", () => {
    const result = deleteNodes(cloneSampleProject(), ["solution"]);
    expect(result.nodes.solution).toBeUndefined();
    expect(result.nodes.overview).toBeUndefined();
    expect(result.nodes.launch.childIds).not.toContain("solution");
    expect(result.presentationOrder).not.toContain("demo");
  });

  it("reparents nodes while preventing circular hierarchy", () => {
    const source = cloneSampleProject();
    expect(canReparent(source, "problem", "pain")).toBe(false);
    expect(reparentNode(source, "problem", "pain")).toBe(source);
    const moved = reparentNode(source, "pain", "market");
    expect(moved.nodes.pain.parentId).toBe("market");
    expect(moved.nodes.problem.childIds).not.toContain("pain");
    expect(moved.nodes.market.childIds).toContain("pain");
  });

  it("hides descendants of collapsed branches", () => {
    const source = cloneSampleProject();
    source.nodes.problem.isCollapsed = true;
    const ids = visibleNodeIds(source);
    expect(ids).toContain("problem");
    expect(ids).not.toContain("pain");
    expect(ids).toContain("solution");
  });
});

describe("mind-map layout", () => {
  it.each(["horizontal", "vertical", "radial"] as const)("maps every node in %s layout", (direction) => {
    const project = cloneSampleProject();
    const positions = calculateLayout(project, direction);
    expect(Object.keys(positions)).toHaveLength(Object.keys(project.nodes).length);
    expect(Object.values(positions).every(({ x, y }) => Number.isFinite(x) && Number.isFinite(y))).toBe(true);
  });
});
