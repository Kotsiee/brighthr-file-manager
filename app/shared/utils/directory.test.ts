import { describe, expect, it } from "vitest";
import { FMFile } from "../contracts/FMFile";
import {
  enterFolder,
  getBreadcrumbs,
  getDirectory,
  goToBreadcrumb,
  goUp,
  isValidPath,
  ROOT_BREADCRUMB_NAME,
} from "./directory";

const tree: FMFile[] = [
  { type: "pdf", name: "Employee Handbook" },
  {
    type: "folder",
    name: "Level 1",
    files: [
      { type: "doc", name: "Level 1 file" },
      {
        type: "folder",
        name: "Level 2",
        files: [{ type: "doc", name: "Deep file" }],
      },
    ],
  },
  { type: "folder", name: "No files key" },
];

const names = (files: FMFile[]) => files.map((f) => f.name);

describe("getDirectory", () => {
  it("returns the root for an empty path", () => {
    expect(getDirectory(tree, [])).toBe(tree);
  });

  it("returns a folder's contents", () => {
    expect(names(getDirectory(tree, ["Level 1"]))).toEqual([
      "Level 1 file",
      "Level 2",
    ]);
  });

  it("follows nested paths", () => {
    expect(names(getDirectory(tree, ["Level 1", "Level 2"]))).toEqual([
      "Deep file",
    ]);
  });

  it("returns an empty list for a folder that doesn't exist", () => {
    expect(getDirectory(tree, ["Nope"])).toEqual([]);
  });

  it("returns an empty list if a later segment doesn't exist", () => {
    expect(getDirectory(tree, ["Level 1", "Nope"])).toEqual([]);
  });

  it("does not treat a plain file as a folder", () => {
    expect(getDirectory(tree, ["Employee Handbook"])).toEqual([]);
  });

  it("returns an empty list for a folder with no files key", () => {
    expect(getDirectory(tree, ["No files key"])).toEqual([]);
  });

  it("only looks for each segment in the level above it", () => {
    expect(getDirectory(tree, ["Level 2"])).toEqual([]);
  });
});

describe("isValidPath", () => {
  it("accepts the root", () => {
    expect(isValidPath(tree, [])).toBe(true);
  });

  it("accepts real nested folders", () => {
    expect(isValidPath(tree, ["Level 1", "Level 2"])).toBe(true);
  });

  it("accepts an empty folder", () => {
    expect(isValidPath(tree, ["No files key"])).toBe(true);
  });

  it("rejects missing folders and files", () => {
    expect(isValidPath(tree, ["Nope"])).toBe(false);
    expect(isValidPath(tree, ["Employee Handbook"])).toBe(false);
    expect(isValidPath(tree, ["Level 1", "Level 1 file"])).toBe(false);
  });
});

describe("getBreadcrumbs", () => {
  it("has only the root crumb at the root", () => {
    expect(getBreadcrumbs([])).toEqual([
      { name: ROOT_BREADCRUMB_NAME, index: -1 },
    ]);
  });

  it("adds a crumb per folder with its path index", () => {
    expect(getBreadcrumbs(["Level 1", "Level 2"])).toEqual([
      { name: ROOT_BREADCRUMB_NAME, index: -1 },
      { name: "Level 1", index: 0 },
      { name: "Level 2", index: 1 },
    ]);
  });
});

describe("path helpers", () => {
  it("enterFolder appends without mutating", () => {
    const path = ["A"];
    expect(enterFolder(path, "B")).toEqual(["A", "B"]);
    expect(path).toEqual(["A"]);
  });

  it("goToBreadcrumb keeps the path up to and including the index", () => {
    expect(goToBreadcrumb(["A", "B", "C"], 0)).toEqual(["A"]);
    expect(goToBreadcrumb(["A", "B", "C"], 2)).toEqual(["A", "B", "C"]);
  });

  it("goToBreadcrumb with -1 returns to the root", () => {
    expect(goToBreadcrumb(["A", "B"], -1)).toEqual([]);
  });

  it("goToBreadcrumb clamps indexes below -1 to the root", () => {
    expect(goToBreadcrumb(["A", "B"], -5)).toEqual([]);
  });

  it("goUp removes the last folder", () => {
    expect(goUp(["A", "B"])).toEqual(["A"]);
  });

  it("goUp at the root stays at the root", () => {
    expect(goUp([])).toEqual([]);
  });
});
