import { MouseEvent } from "react";

/** Interactive rows inside a popover that arrow keys move between. */
export const POPOVER_ITEM_SELECTOR =
  '[role="option"], [role="menuitem"], [role="menuitemradio"]';

/**
 * Where focus goes when a popover opens or its content changes:
 * the checked/selected row (falling back to the first), the first or last row, or a CSS selector
 * (also falling back to the first row).
 */
export type FocusTarget = "selected" | "first" | "last" | { selector: string };

export function getPopoverItems(panel: HTMLElement): HTMLElement[] {
  return Array.from(panel.querySelectorAll<HTMLElement>(POPOVER_ITEM_SELECTOR));
}

export function findFocusTarget(
  panel: HTMLElement,
  target: FocusTarget,
): HTMLElement | undefined {
  const items = getPopoverItems(panel);

  if (target === "first") return items[0];
  if (target === "last") return items.at(-1);
  if (target === "selected") {
    return (
      items.find(
        (item) =>
          item.getAttribute("aria-selected") === "true" ||
          item.getAttribute("aria-checked") === "true",
      ) ?? items[0]
    );
  }
  return panel.querySelector<HTMLElement>(target.selector) ?? items[0];
}

/**
 * The row index a navigation key moves to, wrapping at both ends, or null for other keys.
 * `current` is -1 when no row has focus.
 */
export function getNextItemIndex(
  key: string,
  current: number,
  count: number,
): number | null {
  if (count === 0) return null;

  switch (key) {
    case "ArrowDown":
      return (current + 1) % count;
    case "ArrowUp":
      return current <= 0 ? count - 1 : current - 1;
    case "Home":
      return 0;
    case "End":
      return count - 1;
    default:
      return null;
  }
}

/** Keeps a single highlight: the row under the pointer takes focus, so hover and focus agree. */
export function focusOnPointerMove(event: MouseEvent<HTMLElement>) {
  if (document.activeElement !== event.currentTarget) {
    event.currentTarget.focus({ preventScroll: true });
  }
}
