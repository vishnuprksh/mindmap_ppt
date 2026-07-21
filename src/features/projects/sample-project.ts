import { PROJECT_SCHEMA_VERSION, type MindMapNode, type Project } from "@/domain/project";
import { textBody, type SlideLayout } from "@/domain/slide";

const SAMPLE_TIME = "2026-01-01T00:00:00.000Z";

type SampleNode = { id: string; parentId: string | null; title: string; body: string; layout: SlideLayout; depth: number; row: number };

const sampleNodes: SampleNode[] = [
  { id: "launch", parentId: null, title: "Product Launch Plan", body: "A focused plan to take our next product from insight to impact.", layout: "title", depth: 0, row: 8 },
  { id: "problem", parentId: "launch", title: "Problem", body: "The customer need we are solving.", layout: "section", depth: 1, row: 0 },
  { id: "pain", parentId: "problem", title: "Customer pain points", body: "Fragmented workflows, slow handoffs, and limited visibility.", layout: "title-bullets", depth: 2, row: 0 },
  { id: "alternatives", parentId: "problem", title: "Current alternatives", body: "Manual tools are flexible, but costly to coordinate.", layout: "comparison", depth: 2, row: 1 },
  { id: "solution", parentId: "launch", title: "Solution", body: "A simpler way to move from idea to execution.", layout: "section", depth: 1, row: 3 },
  { id: "overview", parentId: "solution", title: "Product overview", body: "One workspace that connects planning and communication.", layout: "title-image", depth: 2, row: 2 },
  { id: "features", parentId: "solution", title: "Key features", body: "Fast creation, structured editing, and instant presentation.", layout: "title-bullets", depth: 2, row: 3 },
  { id: "demo", parentId: "solution", title: "Demo", body: "From a blank canvas to a presentation in minutes.", layout: "full-image", depth: 2, row: 4 },
  { id: "market", parentId: "launch", title: "Market", body: "A large and growing knowledge-work opportunity.", layout: "section", depth: 1, row: 6 },
  { id: "users", parentId: "market", title: "Target users", body: "Product teams, educators, consultants, and founders.", layout: "two-column", depth: 2, row: 5 },
  { id: "size", parentId: "market", title: "Market size", body: "Knowledge workers increasingly expect connected tools.", layout: "title-bullets", depth: 2, row: 6 },
  { id: "competitors", parentId: "market", title: "Competitors", body: "We combine the speed of mapping with presentation quality.", layout: "comparison", depth: 2, row: 7 },
  { id: "business", parentId: "launch", title: "Business model", body: "Simple pricing that scales with value.", layout: "section", depth: 1, row: 9 },
  { id: "pricing", parentId: "business", title: "Pricing", body: "Free for individuals, paid plans for professional teams.", layout: "two-column", depth: 2, row: 8 },
  { id: "revenue", parentId: "business", title: "Revenue projection", body: "A product-led path to durable recurring revenue.", layout: "title-bullets", depth: 2, row: 9 },
  { id: "roadmap", parentId: "launch", title: "Roadmap", body: "Build the core loop, then deepen collaboration.", layout: "section", depth: 1, row: 12 },
  { id: "status", parentId: "roadmap", title: "Current status", body: "Foundation validated; core experience in development.", layout: "title-bullets", depth: 2, row: 10 },
  { id: "milestones", parentId: "roadmap", title: "Next milestones", body: "Private beta, feedback cycle, and public launch.", layout: "title-bullets", depth: 2, row: 11 },
  { id: "closing", parentId: "launch", title: "Closing", body: "Turn connected thinking into compelling stories.", layout: "section", depth: 1, row: 15 },
  { id: "takeaway", parentId: "closing", title: "Key takeaway", body: "The map is the deck—no rebuilding required.", layout: "quote", depth: 2, row: 12 },
  { id: "action", parentId: "closing", title: "Call to action", body: "Start mapping your next presentation.", layout: "title", depth: 2, row: 13 },
];

export const sampleProject: Project = {
  id: "sample-product-launch",
  title: "Product Launch Plan",
  description: "A sample project showing how a mind map becomes a presentation.",
  rootNodeId: "launch",
  nodes: Object.fromEntries(sampleNodes.map((item): [string, MindMapNode] => [item.id, {
    id: item.id,
    parentId: item.parentId,
    childIds: sampleNodes.filter((candidate) => candidate.parentId === item.id).map((child) => child.id),
    position: { x: item.depth * 320 + 80, y: item.row * 110 + 60 },
    size: { width: 240, height: 135 },
    title: item.title,
    slide: { layout: item.layout, title: item.title, body: textBody(item.body), background: { type: "theme" }, textAlignment: item.layout === "title" || item.layout === "section" ? "center" : "left" },
    isCollapsed: false,
    isHiddenFromPresentation: false,
    createdAt: SAMPLE_TIME,
    updatedAt: SAMPLE_TIME,
  }])),
  presentationOrder: sampleNodes.map((node) => node.id),
  themeId: "minimal-light",
  createdAt: SAMPLE_TIME,
  updatedAt: SAMPLE_TIME,
  version: PROJECT_SCHEMA_VERSION,
};

export function cloneSampleProject(): Project {
  return structuredClone(sampleProject);
}
