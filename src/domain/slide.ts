export const slideLayouts = [
  "title",
  "section",
  "title-bullets",
  "title-image",
  "image-caption",
  "two-column",
  "comparison",
  "quote",
  "full-image",
  "blank",
] as const;

export type SlideLayout = (typeof slideLayouts)[number];

export type RichTextMark = {
  type: "bold" | "italic" | "underline" | "strike";
};

export type RichTextNode = {
  type: "doc" | "paragraph" | "text" | "bulletList" | "listItem";
  text?: string;
  marks?: RichTextMark[];
  content?: RichTextNode[];
};

export type RichTextContent = {
  type: "doc";
  content: RichTextNode[];
};

export type SlideImage = {
  blobId: string;
  alt: string;
  fit: "cover" | "contain" | "fill";
  crop?: { x: number; y: number; width: number; height: number };
};

export type SlideBackground =
  | { type: "theme" }
  | { type: "color"; value: string }
  | { type: "gradient"; from: string; to: string; angle: number };

export type SlideContent = {
  layout: SlideLayout;
  title: string;
  body: RichTextContent;
  image?: SlideImage;
  secondaryImage?: SlideImage;
  caption?: string;
  quoteAuthor?: string;
  speakerNotes?: string;
  background: SlideBackground;
  textAlignment?: "left" | "center" | "right";
};

export function textBody(text: string): RichTextContent {
  return {
    type: "doc",
    content: text
      ? [{ type: "paragraph", content: [{ type: "text", text }] }]
      : [{ type: "paragraph" }],
  };
}

export function richTextToPlainText(content: RichTextContent): string {
  const read = (node: RichTextNode): string =>
    [node.text ?? "", ...(node.content?.map(read) ?? [])].join("");
  return content.content.map(read).filter(Boolean).join(" ");
}
