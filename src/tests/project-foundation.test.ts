import { describe, expect, it } from "vitest";
import { countPresentationSlides, PROJECT_SCHEMA_VERSION } from "@/domain/project";
import { richTextToPlainText, textBody } from "@/domain/slide";
import { cloneSampleProject, sampleProject } from "@/features/projects/sample-project";
import { parseProject } from "@/lib/validation/project-schema";

describe("project foundation", () => {
  it("ships a valid, normalized sample project", () => {
    const parsed = parseProject(sampleProject);
    expect(parsed.version).toBe(PROJECT_SCHEMA_VERSION);
    expect(parsed.nodes.launch.childIds).toEqual(["problem", "solution", "market", "business", "roadmap", "closing"]);
    expect(countPresentationSlides(parsed)).toBe(21);
  });

  it("clones sample state without sharing nested references", () => {
    const copy = cloneSampleProject();
    copy.nodes.launch.title = "Changed";
    expect(sampleProject.nodes.launch.title).toBe("Product Launch Plan");
  });

  it("rejects a project with a missing parent", () => {
    const invalid = cloneSampleProject();
    invalid.nodes.problem.parentId = "missing";
    expect(() => parseProject(invalid)).toThrow("missing parent");
  });

  it("converts structured body content to a compact preview", () => {
    expect(richTextToPlainText(textBody("A concise idea"))).toBe("A concise idea");
  });
});
