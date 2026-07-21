import { z } from "zod";
import { PROJECT_SCHEMA_VERSION, type Project } from "@/domain/project";
import { slideLayouts, type RichTextNode } from "@/domain/slide";

const richTextNodeSchema: z.ZodType<RichTextNode> = z.lazy(() => z.object({
  type: z.enum(["doc", "paragraph", "text", "bulletList", "listItem"]),
  text: z.string().optional(),
  marks: z.array(z.object({ type: z.enum(["bold", "italic", "underline", "strike"]) })).optional(),
  content: z.array(richTextNodeSchema).optional(),
}));

const imageSchema = z.object({
  blobId: z.string().min(1),
  alt: z.string(),
  fit: z.enum(["cover", "contain", "fill"]),
  crop: z.object({ x: z.number(), y: z.number(), width: z.number().positive(), height: z.number().positive() }).optional(),
});

const backgroundSchema = z.discriminatedUnion("type", [
  z.object({ type: z.literal("theme") }),
  z.object({ type: z.literal("color"), value: z.string().min(1) }),
  z.object({ type: z.literal("gradient"), from: z.string().min(1), to: z.string().min(1), angle: z.number() }),
]);

const nodeSchema = z.object({
  id: z.string().min(1),
  parentId: z.string().nullable(),
  childIds: z.array(z.string()),
  position: z.object({ x: z.number(), y: z.number() }),
  size: z.object({ width: z.number().positive(), height: z.number().positive() }),
  title: z.string(),
  slide: z.object({
    layout: z.enum(slideLayouts),
    title: z.string(),
    body: z.object({ type: z.literal("doc"), content: z.array(richTextNodeSchema) }),
    image: imageSchema.optional(),
    secondaryImage: imageSchema.optional(),
    caption: z.string().optional(),
    quoteAuthor: z.string().optional(),
    speakerNotes: z.string().optional(),
    background: backgroundSchema,
    textAlignment: z.enum(["left", "center", "right"]).optional(),
  }),
  isCollapsed: z.boolean(),
  isHiddenFromPresentation: z.boolean(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});

export const projectSchema: z.ZodType<Project> = z.object({
  id: z.string().min(1),
  title: z.string().min(1),
  description: z.string().optional(),
  rootNodeId: z.string().nullable(),
  nodes: z.record(z.string(), nodeSchema),
  presentationOrder: z.array(z.string()),
  themeId: z.string().min(1),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
  version: z.literal(PROJECT_SCHEMA_VERSION),
});

export function parseProject(value: unknown): Project {
  const project = projectSchema.parse(value);
  if (project.rootNodeId !== null && !project.nodes[project.rootNodeId]) {
    throw new Error("The project root node is missing.");
  }
  for (const node of Object.values(project.nodes)) {
    if (node.parentId !== null && !project.nodes[node.parentId]) {
      throw new Error(`Node “${node.title}” has a missing parent.`);
    }
    if (node.childIds.some((id) => !project.nodes[id])) {
      throw new Error(`Node “${node.title}” references a missing child.`);
    }
  }
  return project;
}
