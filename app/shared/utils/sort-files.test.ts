import { describe, expect, it } from "vitest";
import { FMFile } from "../contracts/FMFile";
import sortFiles from "./sort-files";

// JSON data carries `added` as a string; sortFiles parses it with `new Date`.
const file = (name: string, added: string, type = "doc"): FMFile =>
  ({ type, name, added }) as unknown as FMFile;

const folder = (name: string, files: FMFile[] = []): FMFile => ({
  type: "folder",
  name,
  files,
});

const names = (files: FMFile[]) => files.map((f) => f.name);

const files: FMFile[] = [
  file("Charlie", "2017-01-06"),
  folder("Zulu"),
  file("Alpha", "2016-12-06"),
  folder("Bravo"),
  file("Delta", "2018-03-01"),
];

describe("sortFiles", () => {
  describe("by name", () => {
    it("sorts A-Z by default with folders first", () => {
      expect(names(sortFiles(files, "name"))).toEqual([
        "Bravo",
        "Zulu",
        "Alpha",
        "Charlie",
        "Delta",
      ]);
    });

    it("sorts Z-A when descending, keeping folders first", () => {
      expect(names(sortFiles(files, "name", "desc"))).toEqual([
        "Zulu",
        "Bravo",
        "Delta",
        "Charlie",
        "Alpha",
      ]);
    });
  });

  describe("by date added", () => {
    it("sorts oldest first when ascending, folders first A-Z", () => {
      expect(names(sortFiles(files, "added", "asc"))).toEqual([
        "Bravo",
        "Zulu",
        "Alpha",
        "Charlie",
        "Delta",
      ]);
    });

    it("sorts newest first when descending, folders first Z-A", () => {
      expect(names(sortFiles(files, "added", "desc"))).toEqual([
        "Zulu",
        "Bravo",
        "Delta",
        "Charlie",
        "Alpha",
      ]);
    });

    it("orders by date rather than by name", () => {
      const input = [file("Aardvark", "2020-01-01"), file("Zebra", "2010-01-01")];
      expect(names(sortFiles(input, "added"))).toEqual(["Zebra", "Aardvark"]);
    });
  });

  it("sorts the contents of folders recursively", () => {
    const input = [
      folder("Parent", [
        file("Second", "2017-01-02"),
        folder("Child", [file("Y", "2017-01-01"), file("X", "2017-01-01")]),
        file("First", "2017-01-01"),
      ]),
    ];

    const [parent] = sortFiles(input, "name");

    expect(names(parent.files!)).toEqual(["Child", "First", "Second"]);
    expect(names(parent.files![0].files!)).toEqual(["X", "Y"]);
  });

  it("does not mutate the input", () => {
    const input = [folder("B", [file("2", "2017"), file("1", "2016")]), folder("A")];
    const copy = structuredClone(input);

    sortFiles(input, "name");

    expect(input).toEqual(copy);
  });

  it("returns an empty array for an empty list", () => {
    expect(sortFiles([], "name")).toEqual([]);
  });

  it("does not add a files property to plain files", () => {
    const [result] = sortFiles([file("Doc", "2017-01-01")], "name");
    expect(result).not.toHaveProperty("files");
  });
});
