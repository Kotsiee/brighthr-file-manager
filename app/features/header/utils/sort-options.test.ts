import { describe, expect, it } from "vitest";
import { flipSortOrder, getSortOrderLabel, SORT_OPTIONS } from "./sort-options";

describe("SORT_OPTIONS", () => {
  it("offers Date Added first, then Name", () => {
    expect(SORT_OPTIONS).toEqual([
      { value: "added", label: "Date Added" },
      { value: "name", label: "Name" },
    ]);
  });
});

describe("getSortOrderLabel", () => {
  it("describes date order by age", () => {
    expect(getSortOrderLabel("added", "asc")).toBe("Oldest first");
    expect(getSortOrderLabel("added", "desc")).toBe("Newest first");
  });

  it("describes name order alphabetically", () => {
    expect(getSortOrderLabel("name", "asc")).toBe("A to Z");
    expect(getSortOrderLabel("name", "desc")).toBe("Z to A");
  });
});

describe("flipSortOrder", () => {
  it("swaps the direction", () => {
    expect(flipSortOrder("asc")).toBe("desc");
    expect(flipSortOrder("desc")).toBe("asc");
  });
});
