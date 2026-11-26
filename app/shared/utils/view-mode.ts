import { ViewMode } from "../contracts/ViewMode";

export const isViewMode = (value: unknown): value is ViewMode =>
  value === "list" || value === "grid";

export const otherViewMode = (mode: ViewMode): ViewMode =>
  mode === "list" ? "grid" : "list";

export const VIEW_MODE_LABELS: Record<ViewMode, string> = {
  list: "List",
  grid: "Grid",
};
