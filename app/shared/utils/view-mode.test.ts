import { describe, expect, it } from "vitest";
import { otherViewMode, VIEW_MODE_LABELS } from "./view-mode";

describe("otherViewMode", () => {
  it("swaps list and grid", () => {
    expect(otherViewMode("list")).toBe("grid");
    expect(otherViewMode("grid")).toBe("list");
  });
});

describe("VIEW_MODE_LABELS", () => {
  it("has a display label for each mode", () => {
    expect(VIEW_MODE_LABELS).toEqual({ list: "List", grid: "Grid" });
  });
});
