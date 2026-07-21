import { openDB, type DBSchema } from "idb";
import type { Project } from "@/domain/project";
import { parseProject } from "@/lib/validation/project-schema";

const DATABASE_NAME = "mindmap-presenter";
const LAST_PROJECT_KEY = "mindmap-presenter:last-project";

interface MindMapDatabase extends DBSchema {
  projects: { key: string; value: Project; indexes: { "by-updated": string } };
  images: { key: string; value: { id: string; blob: Blob; createdAt: string } };
}

function database() {
  return openDB<MindMapDatabase>(DATABASE_NAME, 1, {
    upgrade(db) {
      const projects = db.createObjectStore("projects", { keyPath: "id" });
      projects.createIndex("by-updated", "updatedAt");
      db.createObjectStore("images", { keyPath: "id" });
    },
  });
}

export async function saveProject(project: Project): Promise<void> {
  const validProject = parseProject(project);
  const db = await database();
  await db.put("projects", validProject);
  localStorage.setItem(LAST_PROJECT_KEY, project.id);
}

export async function loadLastProject(): Promise<Project | null> {
  const id = localStorage.getItem(LAST_PROJECT_KEY);
  if (!id) return null;
  const db = await database();
  const project = await db.get("projects", id);
  return project ? parseProject(project) : null;
}

export async function listProjects(): Promise<Project[]> {
  const db = await database();
  const projects = await db.getAllFromIndex("projects", "by-updated");
  return projects.reverse().map(parseProject);
}
