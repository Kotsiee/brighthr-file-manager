import {
  KeyboardEvent,
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from "react";
import {
  findFocusTarget,
  FocusTarget,
  getNextItemIndex,
  getPopoverItems,
} from "../utils/popover-focus";

/**
 * State and keyboard/pointer behaviour shared by every custom popover:
 * - ArrowDown/ArrowUp on the trigger open it; click toggles it.
 * - ArrowUp/ArrowDown (wrapping), Home and End move between rows.
 * - Escape closes and returns focus to the trigger.
 * - Tab closes, and focus continues on from the trigger.
 * - A pointer press outside the popover closes it.
 * Enter/Space selection is native, because every row is a <button>.
 */
export default function usePopover() {
  const [isOpen, setIsOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const pendingFocus = useRef<FocusTarget | null>(null);

  const open = useCallback((focus: FocusTarget = "selected") => {
    pendingFocus.current = focus;
    setIsOpen(true);
  }, []);

  const close = useCallback(({ returnFocus = true } = {}) => {
    setIsOpen(false);
    if (returnFocus) triggerRef.current?.focus();
  }, []);

  const toggle = useCallback(() => {
    if (isOpen) close();
    else open();
  }, [isOpen, open, close]);

  /** Move focus once the next render has committed, e.g. after switching a popover's view. */
  const focusAfterRender = useCallback((focus: FocusTarget) => {
    pendingFocus.current = focus;
  }, []);

  // Runs after every commit so it catches both opening and in-place content changes.
  useLayoutEffect(() => {
    if (!isOpen || !pendingFocus.current || !panelRef.current) return;
    findFocusTarget(panelRef.current, pendingFocus.current)?.focus();
    pendingFocus.current = null;
  });

  useEffect(() => {
    if (!isOpen) return;

    const onPointerDown = (event: PointerEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) setIsOpen(false);
    };

    document.addEventListener("pointerdown", onPointerDown);
    return () => document.removeEventListener("pointerdown", onPointerDown);
  }, [isOpen]);

  const onTriggerKeyDown = useCallback(
    (event: KeyboardEvent<HTMLElement>) => {
      if (event.key === "ArrowDown") {
        event.preventDefault();
        open("selected");
      } else if (event.key === "ArrowUp") {
        event.preventDefault();
        open("last");
      } else if (event.key === "Escape" && isOpen) {
        event.preventDefault();
        close();
      }
    },
    [isOpen, open, close],
  );

  const onPanelKeyDown = useCallback(
    (event: KeyboardEvent<HTMLElement>) => {
      const panel = panelRef.current;
      if (!panel) return;

      if (event.key === "Escape") {
        event.preventDefault();
        event.stopPropagation();
        close();
        return;
      }

      if (event.key === "Tab") {
        // Not prevented: focus moves on from the trigger, as if the popover had never opened.
        close();
        return;
      }

      const items = getPopoverItems(panel);
      const current = items.indexOf(document.activeElement as HTMLElement);
      const next = getNextItemIndex(event.key, current, items.length);
      if (next !== null) {
        event.preventDefault();
        items[next].focus();
      }
    },
    [close],
  );

  return {
    isOpen,
    open,
    close,
    toggle,
    focusAfterRender,
    rootRef,
    triggerRef,
    panelRef,
    onTriggerKeyDown,
    onPanelKeyDown,
  };
}
