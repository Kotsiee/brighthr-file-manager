import { describe, expect, it } from "vitest";
import { countGridColumns, getNextIndex, NavSection } from "./grid-navigation";

describe("countGridColumns", () => {
  it("counts the tracks in a resolved grid-template-columns", () => {
    expect(countGridColumns("355.2px 355.2px 355.2px 355.2px 355.2px")).toBe(5);
    expect(countGridColumns("320px")).toBe(1);
  });

  it("gives null when there is no layout to count", () => {
    expect(countGridColumns("")).toBeNull();
    expect(countGridColumns("none")).toBeNull();
    expect(countGridColumns("repeat(auto-fill, minmax(300px, 1fr))")).toBeNull();
  });
});

// 0 1 2 3
// 4 5
const grid: NavSection[] = [{ count: 6, columns: 4 }];

// Folders:  0 1
//           2
// Files:    3
//           4
const list: NavSection[] = [
  { count: 3, columns: 2 },
  { count: 2, columns: 1 },
];

describe("getNextIndex", () => {
  it("steps left and right through the flat order, stopping at the ends", () => {
    expect(getNextIndex(grid, 3, "ArrowRight")).toBe(4);
    expect(getNextIndex(grid, 4, "ArrowLeft")).toBe(3);
    expect(getNextIndex(grid, 0, "ArrowLeft")).toBe(0);
    expect(getNextIndex(grid, 5, "ArrowRight")).toBe(5);
  });

  it("moves up and down a column", () => {
    expect(getNextIndex(grid, 1, "ArrowDown")).toBe(5);
    expect(getNextIndex(grid, 5, "ArrowUp")).toBe(1);
    expect(getNextIndex(grid, 1, "ArrowUp")).toBe(1);
  });

  it("lands on the last card when the row below is shorter", () => {
    expect(getNextIndex(grid, 3, "ArrowDown")).toBe(5);
  });

  it("stays put moving down from the last row", () => {
    expect(getNextIndex(grid, 4, "ArrowDown")).toBe(4);
  });

  it("crosses from the folder grid into the file list and back", () => {
    expect(getNextIndex(list, 0, "ArrowDown")).toBe(2);
    expect(getNextIndex(list, 2, "ArrowDown")).toBe(3);
    expect(getNextIndex(list, 3, "ArrowDown")).toBe(4);
    expect(getNextIndex(list, 3, "ArrowUp")).toBe(2);
  });

  it("skips empty sections", () => {
    const filesOnly: NavSection[] = [
      { count: 0, columns: 4 },
      { count: 2, columns: 1 },
    ];
    expect(getNextIndex(filesOnly, 0, "ArrowUp")).toBe(0);
    expect(getNextIndex(filesOnly, 0, "ArrowDown")).toBe(1);
  });

  it("jumps to the ends with Home and End", () => {
    expect(getNextIndex(list, 3, "Home")).toBe(0);
    expect(getNextIndex(list, 0, "End")).toBe(4);
  });

  it("ignores other keys and empty collections", () => {
    expect(getNextIndex(grid, 0, "Enter")).toBeNull();
    expect(getNextIndex([{ count: 0, columns: 4 }], 0, "ArrowDown")).toBeNull();
  });
});
