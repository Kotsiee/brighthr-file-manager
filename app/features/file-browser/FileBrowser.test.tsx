import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";
import { ViewMode } from "@/app/shared/contracts/ViewMode";
import files from "@/app/shared/data/files.json";
import useFiles from "@/app/shared/hooks/useFiles";
import FileBrowser from "./FileBrowser";

const rawJson = JSON.stringify(files);

const nestedJson = JSON.stringify([
  {
    type: "folder",
    name: "Level 1",
    files: [
      {
        type: "folder",
        name: "Level 2",
        files: [
          { type: "doc", name: "Deep file", added: "2020-01-01" },
          { type: "pdf", name: "Other deep file", added: "2020-02-01" },
        ],
      },
    ],
  },
]);

/*
 * Sorted by name, the root is: Expenses, Misc (folders), then Cost centres, Employee Handbook,
 * Public Holiday policy. In two columns, the grid is:
 *
 *   Expenses           Misc
 *   Cost centres       Employee Handbook
 *   Public Holiday policy
 */
function setup(viewMode: ViewMode, json = rawJson) {
  const onOpenFile = vi.fn();

  function Harness() {
    const { files, breadcrumbs, openFolder, navigateToBreadcrumb } = useFiles(json);
    return (
      <FileBrowser
        files={files}
        breadcrumbs={breadcrumbs}
        viewMode={viewMode}
        onOpenFolder={openFolder}
        onNavigateToBreadcrumb={navigateToBreadcrumb}
        onOpenFile={onOpenFile}
      />
    );
  }

  const user = userEvent.setup();
  render(<Harness />);

  const card = (name: string) => screen.getByRole("button", { name: new RegExp(`^${name},`) });
  const breadcrumb = () => within(screen.getByRole("navigation", { name: "Breadcrumb" }));

  return { user, onOpenFile, card, breadcrumb };
}

/**
 * jsdom has no layout, so stand in for the browser: report the card grid as laid out in `count`
 * columns, the way a real computed grid-template-columns lists one length per track. Returns a
 * setter for changing the count mid-test, as a resize would.
 */
function mockGridColumns(initialCount: number) {
  let count = initialCount;
  const getComputedStyle = window.getComputedStyle.bind(window);
  vi.spyOn(window, "getComputedStyle").mockImplementation((element, pseudo) => {
    const style = getComputedStyle(element, pseudo);
    return new Proxy(style, {
      get(target, prop) {
        if (prop === "gridTemplateColumns") return Array(count).fill("300px").join(" ");
        const value = Reflect.get(target, prop);
        return typeof value === "function" ? value.bind(target) : value;
      },
    });
  });
  return (next: number) => {
    count = next;
  };
}

afterEach(() => vi.restoreAllMocks());

describe("FileBrowser", () => {
  describe("rendering", () => {
    it("shows folders and files together in grid view", () => {
      const { card } = setup("grid");

      const grid = screen.getByRole("list", { name: "Folders and files" });
      expect(within(grid).getAllByRole("listitem")).toHaveLength(5);

      expect(card("Expenses")).toHaveAccessibleName("Expenses, folder, 2 files");
      expect(card("Expenses")).toHaveTextContent("2 Files");
      expect(card("Employee Handbook")).toHaveAccessibleName(
        "Employee Handbook, PDF file (.pdf), added 06/01/2017",
      );
      expect(card("Employee Handbook")).toHaveTextContent(".pdf");
      expect(card("Employee Handbook")).toHaveTextContent("06/01/2017");
    });

    it("shows folders above a separate file list in list view", () => {
      const { card } = setup("list");

      const folders = screen.getByRole("list", { name: "Folders" });
      const fileList = screen.getByRole("list", { name: "Files" });

      expect(within(folders).getAllByRole("button")).toEqual([card("Expenses"), card("Misc")]);
      expect(within(fileList).getAllByRole("button")).toEqual([
        card("Cost centres"),
        card("Employee Handbook"),
        card("Public Holiday policy"),
      ]);
      expect(card("Misc")).toHaveTextContent("2 Files");
      expect(card("Cost centres")).toHaveTextContent(".csv");
      expect(card("Cost centres")).toHaveTextContent("12/08/2016");
    });

    it("shows the current folder and how many files it holds, not counting folders", () => {
      const { breadcrumb } = setup("grid");

      expect(breadcrumb().getByText("Documents")).toHaveAttribute("aria-current", "page");
      expect(screen.getByText("3 files")).toBeInTheDocument();
    });
  });

  describe("navigation", () => {
    it("opens a folder on click and goes back up with the breadcrumb", async () => {
      const { user, card, breadcrumb } = setup("grid");

      await user.click(card("Expenses"));

      expect(breadcrumb().getByRole("button", { name: "Documents" })).toBeInTheDocument();
      expect(breadcrumb().getByText("Expenses")).toHaveAttribute("aria-current", "page");
      expect(card("Expenses claim form")).toBeInTheDocument();
      expect(screen.getByText("2 files")).toBeInTheDocument();

      await user.click(breadcrumb().getByRole("button", { name: "Documents" }));

      expect(breadcrumb().queryByRole("button")).not.toBeInTheDocument();
      expect(screen.getByText("3 files")).toBeInTheDocument();
      // Focus returns to the folder that was just left.
      expect(card("Expenses")).toHaveFocus();
    });

    it("opens a focused folder with Enter and focuses its first item", async () => {
      const { user, card, breadcrumb } = setup("list");

      await user.tab();
      expect(card("Expenses")).toHaveFocus();

      await user.keyboard("{Enter}");

      expect(breadcrumb().getByText("Expenses")).toHaveAttribute("aria-current", "page");
      expect(card("Expenses claim form")).toHaveFocus();
    });

    it("selects a file with Enter", async () => {
      const { user, card, onOpenFile } = setup("list");

      card("Cost centres").focus();
      await user.keyboard("{Enter}");

      expect(onOpenFile).toHaveBeenCalledWith(expect.objectContaining({ name: "Cost centres" }));
    });
  });

  describe("keyboard focus", () => {
    it("gives the cards a single tab stop", () => {
      setup("grid");

      const cards = within(screen.getByRole("list", { name: "Folders and files" })).getAllByRole(
        "button",
      );
      expect(cards.filter((c) => c.tabIndex === 0)).toHaveLength(1);
    });

    it("moves by row and column in grid view", async () => {
      mockGridColumns(2);
      const { user, card } = setup("grid");

      card("Expenses").focus();
      await user.keyboard("{ArrowRight}");
      expect(card("Misc")).toHaveFocus();

      await user.keyboard("{ArrowDown}");
      expect(card("Employee Handbook")).toHaveFocus();
      expect(card("Employee Handbook")).toHaveAttribute("tabindex", "0");

      // The row below is shorter, so focus lands on its last card.
      await user.keyboard("{ArrowDown}");
      expect(card("Public Holiday policy")).toHaveFocus();

      await user.keyboard("{ArrowUp}{ArrowLeft}");
      expect(card("Misc")).toHaveFocus();
    });

    it("follows however many columns fit, as the window is resized", async () => {
      const setColumns = mockGridColumns(4);
      const { user, card } = setup("grid");

      card("Expenses").focus();
      await user.keyboard("{ArrowDown}");
      expect(card("Public Holiday policy")).toHaveFocus();

      // Narrowed to three columns: up from the second row lands two cards to the left.
      setColumns(3);
      await user.keyboard("{ArrowUp}");
      expect(card("Misc")).toHaveFocus();
    });

    it("moves from the folder grid down into the file list in list view", async () => {
      mockGridColumns(2);
      const { user, card } = setup("list");

      card("Misc").focus();
      await user.keyboard("{ArrowDown}");
      expect(card("Cost centres")).toHaveFocus();

      await user.keyboard("{ArrowDown}");
      expect(card("Employee Handbook")).toHaveFocus();

      await user.keyboard("{ArrowUp}{ArrowUp}");
      expect(card("Expenses")).toHaveFocus();
    });
  });

  describe("returning to parent folders", () => {
    it("moves up from the top row to the parent folder, and Enter goes back to it", async () => {
      mockGridColumns(2);
      const { user, card, breadcrumb } = setup("grid");
      await user.click(card("Expenses"));

      card("Fuel allowances").focus();
      await user.keyboard("{ArrowUp}");
      const documents = breadcrumb().getByRole("button", { name: "Documents" });
      expect(documents).toHaveFocus();

      await user.keyboard("{Enter}");
      expect(breadcrumb().getByText("Documents")).toHaveAttribute("aria-current", "page");
      expect(card("Expenses")).toHaveFocus();
    });

    it("does the same from the top of the file list in list view", async () => {
      const { user, card, breadcrumb } = setup("list");
      await user.click(card("Misc"));

      card("Christmas party").focus();
      await user.keyboard("{ArrowUp}");

      expect(breadcrumb().getByRole("button", { name: "Documents" })).toHaveFocus();
    });

    it("goes back down to the card it came from", async () => {
      mockGridColumns(2);
      const { user, card } = setup("grid");
      await user.click(card("Expenses"));

      card("Fuel allowances").focus();
      await user.keyboard("{ArrowUp}{ArrowDown}");

      expect(card("Fuel allowances")).toHaveFocus();
    });

    it("moves between ancestor folders with left and right", async () => {
      const { user, card, breadcrumb } = setup("grid", nestedJson);
      await user.click(card("Level 1"));
      await user.click(card("Level 2"));

      card("Deep file").focus();
      await user.keyboard("{ArrowUp}");
      expect(breadcrumb().getByRole("button", { name: "Level 1" })).toHaveFocus();

      await user.keyboard("{ArrowLeft}");
      expect(breadcrumb().getByRole("button", { name: "Documents" })).toHaveFocus();

      // The current folder isn't a destination, so right stops at the parent.
      await user.keyboard("{ArrowRight}{ArrowRight}");
      expect(breadcrumb().getByRole("button", { name: "Level 1" })).toHaveFocus();

      await user.keyboard("{ArrowLeft}{Enter}");
      expect(breadcrumb().getByText("Documents")).toHaveAttribute("aria-current", "page");
      expect(card("Level 1")).toHaveFocus();
    });

    it("stays on the card at the root, where there's no parent", async () => {
      const { user, card } = setup("grid");

      card("Expenses").focus();
      await user.keyboard("{ArrowUp}");

      expect(card("Expenses")).toHaveFocus();
    });
  });
});
