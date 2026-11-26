import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
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
