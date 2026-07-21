export type AppTheme = {
  id: string;
  name: string;
  canvas: string;
  slide: string;
  text: string;
  mutedText: string;
  accent: string;
};

export const themes: AppTheme[] = [
  { id: "minimal-light", name: "Minimal Light", canvas: "#f4f5f7", slide: "#ffffff", text: "#17191d", mutedText: "#667085", accent: "#6d5dfc" },
  { id: "dark-professional", name: "Dark Professional", canvas: "#14161b", slide: "#20232b", text: "#f8fafc", mutedText: "#98a2b3", accent: "#8b7fff" },
  { id: "warm-creative", name: "Warm Creative", canvas: "#f6f1e8", slide: "#fffaf2", text: "#392f2a", mutedText: "#7c6f67", accent: "#e46f44" },
  { id: "corporate-blue", name: "Corporate Blue", canvas: "#edf3fa", slide: "#ffffff", text: "#12233f", mutedText: "#52647f", accent: "#1769aa" },
];
