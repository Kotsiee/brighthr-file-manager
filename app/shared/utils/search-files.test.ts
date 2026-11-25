import { describe, expect, it } from "vitest";
import { FMFile } from "../contracts/FMFile";
import searchFiles from "./search-files";

const tree: FMFile[] = [
  { type: "pdf", name: "Employee Handbook" },
  { type: "pdf", name: "Public Holiday policy" },
  {
    type: "folder",
    name: "Expenses",
    files: [
      { type: "doc", name: "Expenses claim form" },
      { type: "doc", name: "Fuel allowances" },
    ],
  },
  {
    type: "folder",
    name: "Misc",
    files: [
      { type: "doc", name: "Christmas party" },
      {
        type: "folder",
        name: "Archive",
        files: [{ type: "doc", name: "Old holiday rota" }],
      },
    ],
  },
];

const names = (files: FMFile[]) => files.map((f) => f.name);

describe("searchFiles", () => {
  it("returns the directory unchanged for an empty query", () => {
    expect(searchFiles(tree, "")).toBe(tree);
  });

  it("returns the directory unchanged for a whitespace-only query", () => {
    expect(searchFiles(tree, "   ")).toBe(tree);
  });

  it("matches top-level files by partial name", () => {
    expect(names(searchFiles(tree, "handbook"))).toEqual(["Employee Handbook"]);
  });

  it("is case-insensitive", () => {
    expect(names(searchFiles(tree, "HANDBOOK"))).toEqual(["Employee Handbook"]);
  });

  it("trims the query", () => {
    expect(names(searchFiles(tree, "  fuel  "))).toEqual(["Fuel allowances"]);
  });

  it("finds files inside folders", () => {
    expect(names(searchFiles(tree, "christmas"))).toEqual(["Christmas party"]);
  });

  it("finds files in deeply nested folders", () => {
    expect(names(searchFiles(tree, "rota"))).toEqual(["Old holiday rota"]);
  });

  it("returns a matching folder and its matching children", () => {
    expect(names(searchFiles(tree, "expenses"))).toEqual([
      "Expenses",
      "Expenses claim form",
    ]);
  });

  it("returns matches from every level in a flat list", () => {
    expect(names(searchFiles(tree, "holiday"))).toEqual([
      "Public Holiday policy",
      "Old holiday rota",
    ]);
  });

  it("does not return a folder whose name doesn't match", () => {
    expect(names(searchFiles(tree, "fuel"))).not.toContain("Expenses");
  });

  it("returns an empty array when nothing matches", () => {
    expect(searchFiles(tree, "zzz")).toEqual([]);
  });

  it("handles folders with no files property", () => {
    const input: FMFile[] = [{ type: "folder", name: "Empty folder" }];
    expect(names(searchFiles(input, "empty"))).toEqual(["Empty folder"]);
  });
});
