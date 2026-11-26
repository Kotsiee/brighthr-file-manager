import { cleanup, render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import { STORAGE_KEYS } from "@/app/shared/constants/storage-keys";
import files from "@/app/shared/data/files.json";
import FileManager from "./FileManager";

/** Checks the header is wired to the file state shown in the browser below it. */
function setup() {
  const user = userEvent.setup();
  render(<FileManager rawJson={JSON.stringify(files)} />);

  const desktop = within(screen.getByTestId("header-desktop"));
  // Each card's accessible name starts with the item's name.
  const names = () =>
    screen
      .getAllByRole("list", { name: /^(Folders|Files|Folders and files)$/ })
      .flatMap((list) => within(list).getAllByRole("button"))
      .map((card) => card.getAttribute("aria-label")?.split(",")[0]);

  return { user, desktop, names };
}

describe("FileManager header wiring", () => {
  it("lists folders first, then files newest first by default", () => {
    const { names } = setup();

    expect(names()).toEqual([
      "Misc",
      "Expenses",
      "Employee Handbook",
      "Public Holiday policy",
      "Cost centres",
    ]);
  });

  it("filters the list by search", async () => {
    const { user, desktop, names } = setup();

    await user.type(desktop.getByRole("searchbox"), "holiday");

    expect(names()).toEqual(["Public Holiday policy"]);
  });

  it("filters the list by file type", async () => {
    const { user, desktop, names } = setup();

    await user.click(desktop.getByRole("button", { name: /^Filter by type/ }));
    await user.click(desktop.getByRole("option", { name: "PDF" }));

    expect(names()).toEqual(["Employee Handbook", "Public Holiday policy"]);
  });

  it("re-sorts by name and direction", async () => {
    const { user, desktop, names } = setup();

    await user.click(desktop.getByRole("button", { name: /^Sort by/ }));
    await user.click(desktop.getByRole("option", { name: "Name" }));
    await user.click(desktop.getByRole("button", { name: /^Sort order/ }));

    expect(names()).toEqual([
      "Expenses",
      "Misc",
      "Cost centres",
      "Employee Handbook",
      "Public Holiday policy",
    ]);
  });

  it("switches the browser between list and grid view", async () => {
    const { user, desktop } = setup();
    expect(screen.getByRole("list", { name: "Files" })).toBeInTheDocument();

    await user.click(desktop.getByRole("button", { name: "Switch to grid view" }));

    expect(screen.getByRole("list", { name: "Folders and files" })).toBeInTheDocument();
    expect(screen.queryByRole("list", { name: "Files" })).not.toBeInTheDocument();
  });

  it("selects a file when its card is activated", async () => {
    const { user } = setup();
    const card = screen.getByRole("button", { name: /^Cost centres,/ });

    await user.click(card);

    expect(card).toHaveAttribute("aria-current", "true");
  });
});

describe("FileManager page title", () => {
  it("names the folder being viewed", async () => {
    const { user } = setup();
    expect(document.title).toBe("BrightHR - Documents");

    await user.click(screen.getByRole("button", { name: /^Expenses,/ }));
    expect(document.title).toBe("BrightHR - Expenses");

    const breadcrumb = within(screen.getByRole("navigation", { name: "Breadcrumb" }));
    await user.click(breadcrumb.getByRole("button", { name: "Documents" }));
    expect(document.title).toBe("BrightHR - Documents");
  });
});

describe("FileManager remembered state", () => {
  const storeAll = (values: Record<keyof typeof STORAGE_KEYS, string>) =>
    Object.entries(values).forEach(([name, value]) =>
      window.localStorage.setItem(STORAGE_KEYS[name as keyof typeof STORAGE_KEYS], value),
    );

  it("restores the search, filter, sort and view from the last visit, and shows those results", () => {
    storeAll({
      searchQuery: '"policy"',
      fileType: '"pdf"',
      sortType: '"name"',
      sortOrder: '"asc"',
      viewMode: '"grid"',
    });
    const { desktop, names } = setup();

    expect(desktop.getByRole("searchbox")).toHaveValue("policy");
    expect(desktop.getByRole("button", { name: /^Filter by type/ })).toHaveAccessibleName(
      "Filter by type: PDF",
    );
    expect(desktop.getByRole("button", { name: /^Sort by/ })).toHaveAccessibleName("Sort by: Name");
    expect(desktop.getByRole("button", { name: /^Sort order/ })).toHaveAccessibleName(
      "Sort order: A to Z. Switch to Z to A",
    );
    expect(screen.getByRole("list", { name: "Folders and files" })).toBeInTheDocument();
    expect(names()).toEqual(["Public Holiday policy"]);
  });

  it("remembers changes across a reload", async () => {
    const first = setup();
    await first.user.type(first.desktop.getByRole("searchbox"), "e");
    await first.user.click(first.desktop.getByRole("button", { name: /^Sort by/ }));
    await first.user.click(first.desktop.getByRole("option", { name: "Name" }));
    await first.user.click(first.desktop.getByRole("button", { name: "Switch to grid view" }));
    const before = first.names();
    cleanup();

    const { desktop, names } = setup();

    expect(desktop.getByRole("searchbox")).toHaveValue("e");
    expect(screen.getByRole("list", { name: "Folders and files" })).toBeInTheDocument();
    expect(names()).toEqual(before);
  });

  it("ignores corrupted or out-of-date stored values", () => {
    storeAll({
      searchQuery: "{broken",
      fileType: '"xls"',
      sortType: '"size"',
      sortOrder: "null",
      viewMode: '"table"',
    });
    const { desktop, names } = setup();

    expect(desktop.getByRole("searchbox")).toHaveValue("");
    expect(desktop.getByRole("button", { name: /^Filter by type/ })).toHaveAccessibleName(
      "Filter by type: All",
    );
    expect(screen.getByRole("list", { name: "Files" })).toBeInTheDocument();
    expect(names()).toEqual([
      "Misc",
      "Expenses",
      "Employee Handbook",
      "Public Holiday policy",
      "Cost centres",
    ]);
  });
});
