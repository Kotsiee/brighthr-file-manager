import { act, renderHook } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import files from "../data/files.json";
import { ROOT_BREADCRUMB_NAME } from "../utils/directory";
import useFiles from "./useFiles";

const rawJson = JSON.stringify(files);

const nestedJson = JSON.stringify([
  {
    type: "folder",
    name: "Level 1",
    files: [
      {
        type: "folder",
        name: "Level 2",
        files: [{ type: "doc", name: "Deep file", added: "2020-01-01" }],
      },
      { type: "pdf", name: "Level 1 file", added: "2019-01-01" },
    ],
  },
]);

const setup = (json = rawJson) => renderHook(() => useFiles(json));
const names = (list: { name: string }[]) => list.map((f) => f.name);

describe("useFiles", () => {
  describe("initial state", () => {
    it("starts at the root with default filters", () => {
      const { result } = setup();

      expect(result.current.currentPath).toEqual([]);
      expect(result.current.searchQuery).toBe("");
      expect(result.current.fileType).toBe("all");
      expect(result.current.sortType).toBe("name");
      expect(result.current.sortOrder).toBe("asc");
    });

    it("lists root files sorted by name with folders first", () => {
      const { result } = setup();

      expect(names(result.current.files)).toEqual([
        "Expenses",
        "Misc",
        "Cost centres",
        "Employee Handbook",
        "Public Holiday policy",
      ]);
    });
  });

  describe("navigation", () => {
    it("opens a folder and shows its contents", () => {
      const { result } = setup();

      act(() => result.current.openFolder("Misc"));

      expect(result.current.currentPath).toEqual(["Misc"]);
      expect(names(result.current.files)).toEqual([
        "Christmas party",
        "Welcome to the company!",
      ]);
    });

    it("opens nested folders", () => {
      const { result } = setup(nestedJson);

      act(() => result.current.openFolder("Level 1"));
      act(() => result.current.openFolder("Level 2"));

      expect(result.current.currentPath).toEqual(["Level 1", "Level 2"]);
      expect(names(result.current.files)).toEqual(["Deep file"]);
    });

    it("clears the search query when opening a folder", () => {
      const { result } = setup();

      act(() => result.current.setSearchQuery("expenses"));
      act(() => result.current.openFolder("Expenses"));

      expect(result.current.searchQuery).toBe("");
      expect(result.current.files).toHaveLength(2);
    });

    it("navigates back up via a breadcrumb", () => {
      const { result } = setup(nestedJson);

      act(() => result.current.openFolder("Level 1"));
      act(() => result.current.openFolder("Level 2"));
      act(() => result.current.navigateToBreadcrumb(0));

      expect(result.current.currentPath).toEqual(["Level 1"]);
      expect(names(result.current.files)).toEqual(["Level 2", "Level 1 file"]);
    });

    it("returns to the root with breadcrumb index -1", () => {
      const { result } = setup();

      act(() => result.current.openFolder("Misc"));
      act(() => result.current.navigateToBreadcrumb(-1));

      expect(result.current.currentPath).toEqual([]);
      expect(result.current.files).toHaveLength(5);
    });

    it("builds breadcrumbs for the current path", () => {
      const { result } = setup(nestedJson);

      expect(result.current.breadcrumbs).toEqual([{ name: ROOT_BREADCRUMB_NAME, index: -1 }]);
      expect(result.current.isAtRoot).toBe(true);

      act(() => result.current.openFolder("Level 1"));
      act(() => result.current.openFolder("Level 2"));

      expect(result.current.isAtRoot).toBe(false);
      expect(result.current.breadcrumbs).toEqual([
        { name: ROOT_BREADCRUMB_NAME, index: -1 },
        { name: "Level 1", index: 0 },
        { name: "Level 2", index: 1 },
      ]);
    });

    it("goes up one folder at a time and stops at the root", () => {
      const { result } = setup(nestedJson);

      act(() => result.current.openFolder("Level 1"));
      act(() => result.current.openFolder("Level 2"));
      act(() => result.current.goUp());

      expect(result.current.currentPath).toEqual(["Level 1"]);

      act(() => result.current.goUp());
      act(() => result.current.goUp());

      expect(result.current.currentPath).toEqual([]);
      expect(names(result.current.files)).toEqual(["Level 1"]);
    });

    it("shows an empty list for a folder that doesn't exist", () => {
      const { result } = setup();

      act(() => result.current.openFolder("Nope"));

      expect(result.current.files).toEqual([]);
    });

    it("does not open a plain file as a folder", () => {
      const { result } = setup();

      act(() => result.current.openFolder("Employee Handbook"));

      expect(result.current.files).toEqual([]);
    });
  });

  describe("search", () => {
    it("searches recursively from the current directory", () => {
      const { result } = setup();

      act(() => result.current.setSearchQuery("party"));

      expect(names(result.current.files)).toEqual(["Christmas party"]);
    });

    it("only searches within the open folder", () => {
      const { result } = setup();

      act(() => result.current.openFolder("Expenses"));
      act(() => result.current.setSearchQuery("party"));

      expect(result.current.files).toEqual([]);
    });

    it("ignores a whitespace-only query", () => {
      const { result } = setup();

      act(() => result.current.setSearchQuery("   "));

      expect(result.current.files).toHaveLength(5);
    });
  });

  describe("type filter", () => {
    it("filters the current directory by type", () => {
      const { result } = setup();

      act(() => result.current.setFileType("pdf"));

      expect(names(result.current.files)).toEqual([
        "Employee Handbook",
        "Public Holiday policy",
      ]);
    });

    it("combines with search", () => {
      const { result } = setup();

      act(() => result.current.setSearchQuery("a"));
      act(() => result.current.setFileType("doc"));

      expect(result.current.files.every((f) => f.type === "doc")).toBe(true);
      expect(names(result.current.files)).toEqual([
        "Christmas party",
        "Expenses claim form",
        "Fuel allowances",
      ]);
    });

    it("shows everything again when reset to all", () => {
      const { result } = setup();

      act(() => result.current.setFileType("csv"));
      act(() => result.current.setFileType("all"));

      expect(result.current.files).toHaveLength(5);
    });
  });

  describe("sorting", () => {
    it("sorts by name descending", () => {
      const { result } = setup();

      act(() => result.current.setSortOrder("desc"));

      expect(names(result.current.files)).toEqual([
        "Misc",
        "Expenses",
        "Public Holiday policy",
        "Employee Handbook",
        "Cost centres",
      ]);
    });

    it("sorts by date added", () => {
      const { result } = setup();

      act(() => result.current.setSortType("added"));

      expect(names(result.current.files)).toEqual([
        "Expenses",
        "Misc",
        "Cost centres",
        "Public Holiday policy",
        "Employee Handbook",
      ]);
    });

    it("sorts by date added, newest first", () => {
      const { result } = setup();

      act(() => result.current.setSortType("added"));
      act(() => result.current.setSortOrder("desc"));

      expect(names(result.current.files)).toEqual([
        "Misc",
        "Expenses",
        "Employee Handbook",
        "Public Holiday policy",
        "Cost centres",
      ]);
    });
  });

  it("re-parses when the raw JSON changes", () => {
    const { result, rerender } = renderHook(({ json }) => useFiles(json), {
      initialProps: { json: rawJson },
    });

    rerender({ json: nestedJson });

    expect(names(result.current.files)).toEqual(["Level 1"]);
  });
});
