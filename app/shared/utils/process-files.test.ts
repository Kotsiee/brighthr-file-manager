import { describe, expect, it } from "vitest";
import processFiles from "./process-files";
import files from "../data/files.json";

describe("processFiles", () => {
  it("returns an empty array for an empty list", () => {
    expect(processFiles("[]")).toEqual([]);
  });

  it("parses a flat list of files", () => {
    const input = [
      { type: "pdf", name: "Employee Handbook", added: "2017-01-06" },
      { type: "csv", name: "Cost centres", added: "2016-08-12" },
    ];

    expect(processFiles(JSON.stringify(input))).toEqual(input);
  });

  it("processes the files inside a folder", () => {
    const input = [
      {
        type: "folder",
        name: "Expenses",
        files: [
          { type: "doc", name: "Expenses claim form", added: "2017-05-02" },
          { type: "doc", name: "Fuel allowances", added: "2017-05-03" },
        ],
      },
    ];

    const [folder] = processFiles(JSON.stringify(input));

    expect(folder.type).toBe("folder");
    expect(folder.files).toHaveLength(2);
    expect(folder.files?.map((f) => f.name)).toEqual([
      "Expenses claim form",
      "Fuel allowances",
    ]);
  });

  it("handles folders nested several levels deep", () => {
    const input = [
      {
        type: "folder",
        name: "Level 1",
        files: [
          {
            type: "folder",
            name: "Level 2",
            files: [{ type: "doc", name: "Deep file", added: "2020-01-01" }],
          },
        ],
      },
    ];

    const [level1] = processFiles(JSON.stringify(input));
    const level2 = level1.files?.[0];

    expect(level2?.name).toBe("Level 2");
    expect(level2?.files?.[0].name).toBe("Deep file");
  });

  it("keeps an empty folder as an empty array", () => {
    const input = [{ type: "folder", name: "Empty", files: [] }];

    expect(processFiles(JSON.stringify(input))).toEqual(input);
  });

  it("does not add a files property to plain files", () => {
    const [file] = processFiles(
      JSON.stringify([{ type: "pdf", name: "Doc", added: "2017-01-06" }]),
    );

    expect(file).not.toHaveProperty("files");
  });

  it("processes the bundled files.json data", () => {
    const result = processFiles(JSON.stringify(files));

    expect(result).toHaveLength(5);
    expect(result.filter((f) => f.type === "folder")).toHaveLength(2);
    expect(result.find((f) => f.name === "Misc")?.files).toHaveLength(2);
  });

  it("throws on invalid JSON", () => {
    expect(() => processFiles("not json")).toThrow(SyntaxError);
  });
});
