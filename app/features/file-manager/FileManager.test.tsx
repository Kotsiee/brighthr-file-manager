import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import files from "@/app/shared/data/files.json";
import FileManager from "./FileManager";

/*
 * Checks the header is wired to the file state. The list asserted on here is the temporary
 * placeholder; update these queries when the real file list replaces it.
 */
function setup() {
  const user = userEvent.setup();
  render(<FileManager rawJson={JSON.stringify(files)} />);

  const desktop = within(screen.getByTestId("header-desktop"));
  const names = () =>
    within(screen.getByRole("list", { name: "Documents" }))
      .getAllByRole("listitem")
      .map((li) => li.firstChild?.textContent);

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

  it("switches the list between list and grid view", async () => {
    const { user, desktop } = setup();
    const list = screen.getByRole("list", { name: "Documents" });
    expect(list).toHaveAttribute("data-view", "list");

    await user.click(desktop.getByRole("button", { name: "Switch to grid view" }));

    expect(list).toHaveAttribute("data-view", "grid");
  });
});
