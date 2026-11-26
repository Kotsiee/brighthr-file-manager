import { ViewMode } from "../contracts/ViewMode";

export const otherViewMode = (mode: ViewMode): ViewMode =>
  mode === "list" ? "grid" : "list";

export const VIEW_MODE_LABELS: Record<ViewMode, string> = {
  list: "List",
  grid: "Grid",
};
