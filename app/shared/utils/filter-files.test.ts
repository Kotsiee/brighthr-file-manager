import { describe, expect, it } from "vitest";
import { FMFile } from "../contracts/FMFile";
import { filterFilesByType } from "./filter-files";

const files: FMFile[] = [
  { type: "pdf", name: "Employee Handbook" },
  { type: "doc", name: "Fuel allowances" },
  { type: "pdf", name: "Public Holiday policy" },
  { type: "folder", name: "Misc", files: [{ type: "pdf", name: "Nested" }] },
];

describe("filterFilesByType", () => {
  it("returns only files of the given type", () => {
    expect(filterFilesByType(files, "pdf").map((f) => f.name)).toEqual([
      "Employee Handbook",
      "Public Holiday policy",
    ]);
  });

  it("can filter to folders", () => {
    expect(filterFilesByType(files, "folder").map((f) => f.name)).toEqual([
      "Misc",
    ]);
  });

  it("does not look inside folders", () => {
    expect(filterFilesByType(files, "pdf")).not.toContainEqual(
      expect.objectContaining({ name: "Nested" }),
    );
  });

  it("returns an empty array when nothing matches", () => {
    expect(filterFilesByType(files, "mov")).toEqual([]);
  });

  it("returns an empty array for an empty list", () => {
    expect(filterFilesByType([], "pdf")).toEqual([]);
  });

  it("matches the type exactly, including case", () => {
    expect(filterFilesByType(files, "PDF")).toEqual([]);
  });

  it("does not mutate the input", () => {
    const copy = structuredClone(files);
    filterFilesByType(files, "pdf");
    expect(files).toEqual(copy);
  });
});
