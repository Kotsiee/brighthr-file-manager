import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useState } from "react";
import { describe, expect, it, vi } from "vitest";
import { Option } from "@/app/shared/contracts/Option";
import { ViewMode } from "@/app/shared/contracts/ViewMode";
import { SortOrder, SortType } from "@/app/shared/utils/sort-files";
import Header from "./Header";

const FILE_TYPES: Option[] = [
  { value: "all", label: "All" },
  { value: "pdf", label: "PDF" },
  { value: "doc", label: "DOC" },
  { value: "csv", label: "CSV" },
];

/** Owns the header's state like a real parent would, and exposes spies for each change. */
function setup() {
  const spies = {
    onSearchChange: vi.fn(),
    onFileTypeChange: vi.fn(),
    onSortTypeChange: vi.fn(),
    onSortOrderChange: vi.fn(),
    onViewModeChange: vi.fn(),
  };

  function Harness() {
    const [searchQuery, setSearchQuery] = useState("");
    const [fileType, setFileType] = useState("all");
    const [sortType, setSortType] = useState<SortType>("added");
    const [sortOrder, setSortOrder] = useState<SortOrder>("desc");
    const [viewMode, setViewMode] = useState<ViewMode>("list");

    const tap =
      <T,>(set: (v: T) => void, spy: (v: T) => void) =>
      (v: T) => {
        spy(v);
        set(v);
      };

    return (
      <Header
        searchQuery={searchQuery}
        onSearchChange={tap(setSearchQuery, spies.onSearchChange)}
        fileType={fileType}
        fileTypeOptions={FILE_TYPES}
        onFileTypeChange={tap(setFileType, spies.onFileTypeChange)}
        sortType={sortType}
        onSortTypeChange={tap(setSortType, spies.onSortTypeChange)}
        sortOrder={sortOrder}
        onSortOrderChange={tap(setSortOrder, spies.onSortOrderChange)}
        viewMode={viewMode}
        onViewModeChange={tap(setViewMode, spies.onViewModeChange)}
      />
    );
  }

  const user = userEvent.setup();
  render(<Harness />);

  // Both layouts are in the DOM (CSS picks one), so every query is scoped to a layout.
  const desktop = within(screen.getByTestId("header-desktop"));
  const mobile = within(screen.getByTestId("header-mobile"));

  return { user, spies, desktop, mobile };
}

describe("Header", () => {
  it("renders a banner with the brand logo in both layouts", () => {
    const { desktop, mobile } = setup();

    expect(screen.getByRole("banner")).toBeInTheDocument();
    expect(desktop.getByRole("img", { name: "BrightHR" })).toBeInTheDocument();
    expect(mobile.getByRole("img", { name: "BrightHR" })).toBeInTheDocument();
  });

  describe("desktop search", () => {
    it("is a labelled search box with the expected placeholder", () => {
      const { desktop } = setup();

      expect(desktop.getByRole("search")).toBeInTheDocument();
      expect(desktop.getByRole("searchbox", { name: "Search documents" })).toHaveAttribute(
        "placeholder",
        "Search documents...",
      );
    });

    it("reports each change as the user types", async () => {
      const { user, desktop, spies } = setup();
      const input = desktop.getByRole("searchbox", { name: "Search documents" });

      await user.type(input, "pdf");

      expect(input).toHaveValue("pdf");
      expect(spies.onSearchChange).toHaveBeenLastCalledWith("pdf");
    });

    it("focuses the input when the search button is pressed with an empty box", async () => {
      const { user, desktop } = setup();

      await user.click(desktop.getByRole("button", { name: "Search" }));

      expect(desktop.getByRole("searchbox")).toHaveFocus();
    });
  });

  describe("view switcher", () => {
    it("toggles between list and grid, updating its label", async () => {
      const { user, desktop, spies } = setup();

      await user.click(desktop.getByRole("button", { name: "Switch to grid view" }));
      expect(spies.onViewModeChange).toHaveBeenLastCalledWith("grid");

      await user.click(desktop.getByRole("button", { name: "Switch to list view" }));
      expect(spies.onViewModeChange).toHaveBeenLastCalledWith("list");
    });
  });

  describe("filter dropdown", () => {
    const trigger = (desktop: ReturnType<typeof setup>["desktop"]) =>
      desktop.getByRole("button", { name: /^Filter by type/ });

    it("shows the active filter and is closed by default", () => {
      const { desktop } = setup();

      expect(trigger(desktop)).toHaveAccessibleName("Filter by type: All");
      expect(trigger(desktop)).toHaveAttribute("aria-haspopup", "listbox");
      expect(trigger(desktop)).toHaveAttribute("aria-expanded", "false");
      expect(desktop.queryByRole("listbox")).not.toBeInTheDocument();
    });

    it("opens a listbox on click, marking and focusing the selected option", async () => {
      const { user, desktop } = setup();

      await user.click(trigger(desktop));

      const listbox = desktop.getByRole("listbox", { name: "Filter by type" });
      expect(trigger(desktop)).toHaveAttribute("aria-expanded", "true");
      expect(trigger(desktop)).toHaveAttribute("aria-controls", listbox.id);
      expect(within(listbox).getAllByRole("option").map((o) => o.textContent)).toEqual([
        "All",
        "PDF",
        "DOC",
        "CSV",
      ]);

      const all = within(listbox).getByRole("option", { name: "All" });
      expect(all).toHaveAttribute("aria-selected", "true");
      expect(all).toHaveFocus();
      expect(within(listbox).getByRole("option", { name: "PDF" })).toHaveAttribute(
        "aria-selected",
        "false",
      );
    });

    it("selects an option by click, closes, and returns focus to the trigger", async () => {
      const { user, desktop, spies } = setup();

      await user.click(trigger(desktop));
      await user.click(desktop.getByRole("option", { name: "PDF" }));

      expect(spies.onFileTypeChange).toHaveBeenCalledWith("pdf");
      expect(desktop.queryByRole("listbox")).not.toBeInTheDocument();
      expect(trigger(desktop)).toHaveAccessibleName("Filter by type: PDF");
      expect(trigger(desktop)).toHaveFocus();
    });

    it("toggles closed when the trigger is clicked again", async () => {
      const { user, desktop } = setup();

      await user.click(trigger(desktop));
      await user.click(trigger(desktop));

      expect(desktop.queryByRole("listbox")).not.toBeInTheDocument();
    });

    it("supports full keyboard operation", async () => {
      const { user, desktop, spies } = setup();

      trigger(desktop).focus();
      await user.keyboard("{ArrowDown}");
      expect(desktop.getByRole("option", { name: "All" })).toHaveFocus();

      await user.keyboard("{ArrowDown}");
      expect(desktop.getByRole("option", { name: "PDF" })).toHaveFocus();

      await user.keyboard("{End}");
      expect(desktop.getByRole("option", { name: "CSV" })).toHaveFocus();

      await user.keyboard("{ArrowDown}");
      expect(desktop.getByRole("option", { name: "All" })).toHaveFocus();

      await user.keyboard("{ArrowUp}");
      expect(desktop.getByRole("option", { name: "CSV" })).toHaveFocus();

      await user.keyboard("{Home}{ArrowDown}{ArrowDown}{Enter}");
      expect(spies.onFileTypeChange).toHaveBeenLastCalledWith("doc");
      expect(desktop.queryByRole("listbox")).not.toBeInTheDocument();
      expect(trigger(desktop)).toHaveFocus();
    });

    it("selects with Space", async () => {
      const { user, desktop, spies } = setup();

      trigger(desktop).focus();
      await user.keyboard("{ArrowDown}{ArrowDown}[Space]");

      expect(spies.onFileTypeChange).toHaveBeenLastCalledWith("pdf");
    });

    it("opens on Enter, the native button activation", async () => {
      const { user, desktop } = setup();

      trigger(desktop).focus();
      await user.keyboard("{Enter}");

      expect(desktop.getByRole("listbox")).toBeInTheDocument();
    });

    it("opens on ArrowUp with the last option focused", async () => {
      const { user, desktop } = setup();

      trigger(desktop).focus();
      await user.keyboard("{ArrowUp}");

      expect(desktop.getByRole("option", { name: "CSV" })).toHaveFocus();
    });

    it("closes on Escape without changing the value and returns focus", async () => {
      const { user, desktop, spies } = setup();

      await user.click(trigger(desktop));
      await user.keyboard("{ArrowDown}{Escape}");

      expect(desktop.queryByRole("listbox")).not.toBeInTheDocument();
      expect(spies.onFileTypeChange).not.toHaveBeenCalled();
      expect(trigger(desktop)).toHaveFocus();
    });

    it("closes on Tab and moves focus on to the next control", async () => {
      const { user, desktop } = setup();

      await user.click(trigger(desktop));
      await user.tab();

      expect(desktop.queryByRole("listbox")).not.toBeInTheDocument();
      expect(desktop.getByRole("button", { name: /^Sort order/ })).toHaveFocus();
    });

    it("closes when the user clicks outside it", async () => {
      const { user, desktop } = setup();

      await user.click(trigger(desktop));
      await user.click(document.body);

      expect(desktop.queryByRole("listbox")).not.toBeInTheDocument();
    });

    it("only allows one dropdown open at a time via outside clicks", async () => {
      const { user, desktop } = setup();

      await user.click(trigger(desktop));
      await user.click(desktop.getByRole("button", { name: /^Sort by/ }));

      expect(desktop.getAllByRole("listbox")).toHaveLength(1);
      expect(desktop.getByRole("listbox", { name: "Sort by" })).toBeInTheDocument();
    });
  });

  describe("sort dropdown", () => {
    it("defaults to Date Added, newest first", () => {
      const { desktop } = setup();

      expect(desktop.getByRole("button", { name: /^Sort by/ })).toHaveAccessibleName(
        "Sort by: Date Added",
      );
      expect(desktop.getByRole("button", { name: /^Sort order/ })).toHaveAccessibleName(
        "Sort order: Newest first. Switch to Oldest first",
      );
    });

    it("toggles direction without opening the menu", async () => {
      const { user, desktop, spies } = setup();

      await user.click(desktop.getByRole("button", { name: /^Sort order/ }));

      expect(spies.onSortOrderChange).toHaveBeenLastCalledWith("asc");
      expect(desktop.queryByRole("listbox")).not.toBeInTheDocument();
      expect(desktop.getByRole("button", { name: /^Sort order/ })).toHaveAccessibleName(
        "Sort order: Oldest first. Switch to Newest first",
      );
    });

    it("changes the sort field from the menu", async () => {
      const { user, desktop, spies } = setup();

      await user.click(desktop.getByRole("button", { name: /^Sort by/ }));
      const listbox = desktop.getByRole("listbox", { name: "Sort by" });
      expect(within(listbox).getByRole("option", { name: "Date Added" })).toHaveAttribute(
        "aria-selected",
        "true",
      );

      await user.click(within(listbox).getByRole("option", { name: "Name" }));

      expect(spies.onSortTypeChange).toHaveBeenCalledWith("name");
      expect(desktop.getByRole("button", { name: /^Sort by/ })).toHaveAccessibleName(
        "Sort by: Name",
      );
      // Direction wording follows the field.
      expect(desktop.getByRole("button", { name: /^Sort order/ })).toHaveAccessibleName(
        "Sort order: Z to A. Switch to A to Z",
      );
    });
  });

  describe("mobile search", () => {
    it("replaces the header content with a focused search box", async () => {
      const { user, mobile } = setup();

      await user.click(mobile.getByRole("button", { name: "Search documents" }));

      expect(mobile.getByRole("searchbox", { name: "Search documents" })).toHaveFocus();
      expect(mobile.getByRole("button", { name: "Close search" })).toBeInTheDocument();
      expect(mobile.queryByRole("img", { name: "BrightHR" })).not.toBeInTheDocument();
      expect(mobile.queryByRole("button", { name: "More options" })).not.toBeInTheDocument();
    });

    it("reports typed queries", async () => {
      const { user, mobile, spies } = setup();

      await user.click(mobile.getByRole("button", { name: "Search documents" }));
      await user.keyboard("hand");

      expect(spies.onSearchChange).toHaveBeenLastCalledWith("hand");
    });

    it("closes with the back button, clears the query and restores the header", async () => {
      const { user, mobile, spies } = setup();

      await user.click(mobile.getByRole("button", { name: "Search documents" }));
      await user.keyboard("hand");
      await user.click(mobile.getByRole("button", { name: "Close search" }));

      expect(spies.onSearchChange).toHaveBeenLastCalledWith("");
      expect(mobile.queryByRole("searchbox")).not.toBeInTheDocument();
      expect(mobile.getByRole("img", { name: "BrightHR" })).toBeInTheDocument();
      expect(mobile.getByRole("button", { name: "Search documents" })).toHaveFocus();
    });

    it("closes on Escape", async () => {
      const { user, mobile } = setup();

      await user.click(mobile.getByRole("button", { name: "Search documents" }));
      await user.keyboard("{Escape}");

      expect(mobile.queryByRole("searchbox")).not.toBeInTheDocument();
      expect(mobile.getByRole("button", { name: "Search documents" })).toHaveFocus();
    });
  });

  describe("mobile kebab menu", () => {
    const openMenu = async ({ user, mobile }: ReturnType<typeof setup>) => {
      await user.click(mobile.getByRole("button", { name: "More options" }));
      return mobile.getByRole("menu");
    };

    it("opens a menu with Sort, Filter and the view switch, first item focused", async () => {
      const ctx = setup();
      const trigger = ctx.mobile.getByRole("button", { name: "More options" });
      expect(trigger).toHaveAttribute("aria-haspopup", "menu");
      expect(trigger).toHaveAttribute("aria-expanded", "false");

      const menu = await openMenu(ctx);

      expect(trigger).toHaveAttribute("aria-expanded", "true");
      expect(trigger).toHaveAttribute("aria-controls", menu.id);
      const items = within(menu).getAllByRole("menuitem");
      expect(items.map((i) => i.textContent)).toEqual([
        "SortDate Added",
        "FilterAll",
        "Switch to Grid View",
      ]);
      expect(items[0]).toHaveFocus();
    });

    it("switches view immediately and closes", async () => {
      const ctx = setup();

      const menu = await openMenu(ctx);
      await ctx.user.click(within(menu).getByRole("menuitem", { name: "Switch to Grid View" }));

      expect(ctx.spies.onViewModeChange).toHaveBeenCalledWith("grid");
      expect(ctx.mobile.queryByRole("menu")).not.toBeInTheDocument();
      expect(ctx.mobile.getByRole("button", { name: "More options" })).toHaveFocus();

      const reopened = await openMenu(ctx);
      expect(within(reopened).getByRole("menuitem", { name: "Switch to List View" })).toBeInTheDocument();
    });

    it("shows sort choices in place, with Back returning to the root", async () => {
      const ctx = setup();

      const menu = await openMenu(ctx);
      await ctx.user.click(within(menu).getByRole("menuitem", { name: /^Sort/ }));

      const sortMenu = ctx.mobile.getByRole("menu", { name: "Sort" });
      expect(within(sortMenu).getByRole("menuitem", { name: "Back" })).toBeInTheDocument();
      const dateAdded = within(sortMenu).getByRole("menuitemradio", { name: "Date Added" });
      expect(dateAdded).toHaveAttribute("aria-checked", "true");
      expect(dateAdded).toHaveFocus();
      expect(
        within(within(sortMenu).getByRole("group", { name: "Order" })).getByRole(
          "menuitemradio",
          { name: "Newest first" },
        ),
      ).toHaveAttribute("aria-checked", "true");

      await ctx.user.click(within(sortMenu).getByRole("menuitem", { name: "Back" }));

      const root = ctx.mobile.getByRole("menu", { name: "More options" });
      expect(within(root).getByRole("menuitem", { name: /^Sort/ })).toHaveFocus();
    });

    it("selects a sort field and closes", async () => {
      const ctx = setup();

      const menu = await openMenu(ctx);
      await ctx.user.click(within(menu).getByRole("menuitem", { name: /^Sort/ }));
      await ctx.user.click(ctx.mobile.getByRole("menuitemradio", { name: "Name" }));

      expect(ctx.spies.onSortTypeChange).toHaveBeenCalledWith("name");
      expect(ctx.mobile.queryByRole("menu")).not.toBeInTheDocument();
    });

    it("selects a sort direction", async () => {
      const ctx = setup();

      const menu = await openMenu(ctx);
      await ctx.user.click(within(menu).getByRole("menuitem", { name: /^Sort/ }));
      await ctx.user.click(ctx.mobile.getByRole("menuitemradio", { name: "Oldest first" }));

      expect(ctx.spies.onSortOrderChange).toHaveBeenCalledWith("asc");
    });

    it("selects a filter by keyboard", async () => {
      const ctx = setup();
      ctx.mobile.getByRole("button", { name: "More options" }).focus();

      await ctx.user.keyboard("{ArrowDown}");
      expect(ctx.mobile.getByRole("menuitem", { name: /^Sort/ })).toHaveFocus();

      await ctx.user.keyboard("{ArrowDown}{Enter}");
      const filterMenu = ctx.mobile.getByRole("menu", { name: "Filter" });
      expect(within(filterMenu).getByRole("menuitemradio", { name: "All" })).toHaveFocus();

      await ctx.user.keyboard("{ArrowDown}{ArrowDown}{Enter}");

      expect(ctx.spies.onFileTypeChange).toHaveBeenCalledWith("doc");
      expect(ctx.mobile.queryByRole("menu")).not.toBeInTheDocument();
      expect(ctx.mobile.getByRole("button", { name: "More options" })).toHaveFocus();
    });

    it("includes Back in arrow-key navigation", async () => {
      const ctx = setup();

      const menu = await openMenu(ctx);
      await ctx.user.click(within(menu).getByRole("menuitem", { name: /^Filter/ }));
      await ctx.user.keyboard("{Home}");

      expect(ctx.mobile.getByRole("menuitem", { name: "Back" })).toHaveFocus();
    });

    it("closes from a sub-view on Escape and reopens at the root", async () => {
      const ctx = setup();

      const menu = await openMenu(ctx);
      await ctx.user.click(within(menu).getByRole("menuitem", { name: /^Filter/ }));
      await ctx.user.keyboard("{Escape}");

      expect(ctx.mobile.queryByRole("menu")).not.toBeInTheDocument();
      expect(ctx.mobile.getByRole("button", { name: "More options" })).toHaveFocus();

      await openMenu(ctx);
      expect(ctx.mobile.getByRole("menu", { name: "More options" })).toBeInTheDocument();
    });

    it("closes on an outside click", async () => {
      const ctx = setup();

      await openMenu(ctx);
      await ctx.user.click(document.body);

      expect(ctx.mobile.queryByRole("menu")).not.toBeInTheDocument();
    });
  });
});
