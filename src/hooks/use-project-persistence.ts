"use client";

import { useEffect } from "react";
import { saveProject } from "@/lib/persistence/project-database";
import { useProjectStore } from "@/store/project-store";

export function useProjectPersistence() {
  const hydrate = useProjectStore((state) => state.hydrate);
  const project = useProjectStore((state) => state.project);
  const isHydrated = useProjectStore((state) => state.isHydrated);
  const setSaveStatus = useProjectStore((state) => state.setSaveStatus);

  useEffect(() => { void hydrate(); }, [hydrate]);

  useEffect(() => {
    if (!isHydrated) return;
    setSaveStatus("saving");
    const timeout = window.setTimeout(() => {
      saveProject(project)
        .then(() => setSaveStatus("saved"))
        .catch((error: unknown) => setSaveStatus("error", error instanceof Error ? error.message : "Autosave failed."));
    }, 650);
    return () => window.clearTimeout(timeout);
  }, [isHydrated, project, setSaveStatus]);
}
