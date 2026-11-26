import { describe, expect, it } from "vitest";
import { findFocusTarget, getNextItemIndex, getPopoverItems } from "./popover-focus";

function panel(html: string) {
  const el = document.createElement("div");
  el.innerHTML = html;
  return el;
}

const listbox = panel(`
  <button role="option" aria-selected="false">A</button>
  <button role="option" aria-selected="true">B</button>
  <button role="option" aria-selected="false" data-item="c">C</button>
`);

const text = (el?: HTMLElement) => el?.textContent;

describe("getPopoverItems", () => {
  it("returns option, menuitem and menuitemradio rows in DOM order", () => {
    const el = panel(`
      <button role="menuitem">Back</button>
      <div role="separator"></div>
      <div role="group"><button role="menuitemradio">One</button></div>
      <span>Not a row</span>
      <button role="option">Two</button>
    `);

    expect(getPopoverItems(el).map(text)).toEqual(["Back", "One", "Two"]);
  });
});

describe("findFocusTarget", () => {
  it("finds the selected option", () => {
    expect(text(findFocusTarget(listbox, "selected"))).toBe("B");
  });

  it("finds the checked menu item", () => {
    const menu = panel(`
      <button role="menuitemradio" aria-checked="false">X</button>
      <button role="menuitemradio" aria-checked="true">Y</button>
    `);
    expect(text(findFocusTarget(menu, "selected"))).toBe("Y");
  });

  it("falls back to the first row when nothing is selected", () => {
    const menu = panel(`<button role="menuitem">Sort</button><button role="menuitem">Filter</button>`);
    expect(text(findFocusTarget(menu, "selected"))).toBe("Sort");
  });

  it("finds the first and last rows", () => {
    expect(text(findFocusTarget(listbox, "first"))).toBe("A");
    expect(text(findFocusTarget(listbox, "last"))).toBe("C");
  });

  it("finds a row by selector, falling back to the first row", () => {
    expect(text(findFocusTarget(listbox, { selector: '[data-item="c"]' }))).toBe("C");
    expect(text(findFocusTarget(listbox, { selector: '[data-item="nope"]' }))).toBe("A");
  });

  it("returns undefined for an empty panel", () => {
    expect(findFocusTarget(panel(""), "first")).toBeUndefined();
  });
});

describe("getNextItemIndex", () => {
  it("moves down and wraps to the top", () => {
    expect(getNextItemIndex("ArrowDown", 0, 3)).toBe(1);
    expect(getNextItemIndex("ArrowDown", 2, 3)).toBe(0);
  });

  it("moves up and wraps to the bottom", () => {
    expect(getNextItemIndex("ArrowUp", 2, 3)).toBe(1);
    expect(getNextItemIndex("ArrowUp", 0, 3)).toBe(2);
  });

  it("starts from the ends when nothing has focus", () => {
    expect(getNextItemIndex("ArrowDown", -1, 3)).toBe(0);
    expect(getNextItemIndex("ArrowUp", -1, 3)).toBe(2);
  });

  it("jumps with Home and End", () => {
    expect(getNextItemIndex("Home", 2, 3)).toBe(0);
    expect(getNextItemIndex("End", 0, 3)).toBe(2);
  });

  it("ignores other keys and empty lists", () => {
    expect(getNextItemIndex("Enter", 0, 3)).toBeNull();
    expect(getNextItemIndex("ArrowDown", -1, 0)).toBeNull();
  });
});
