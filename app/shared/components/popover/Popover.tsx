import { ComponentProps, ReactNode } from "react";
import controls from "../../styles/controls.module.css";
import cx from "../../utils/cx";
import { focusOnPointerMove } from "../../utils/popover-focus";
import { CheckIcon } from "../icons";
import styles from "./Popover.module.css";

export function PopoverPanel({ className, ...props }: ComponentProps<"div">) {
  return (
    <div
      className={cx(styles.panel, className ?? styles.fitContent)}
      {...props}
    />
  );
}

interface PopoverChoiceProps {
  role: "option" | "menuitemradio";
  selected: boolean;
  onSelect: () => void;
  children: ReactNode;
}

export function PopoverChoice({
  role,
  selected,
  onSelect,
  children,
}: PopoverChoiceProps) {
  return (
    <button
      type="button"
      role={role}
      tabIndex={-1}
      aria-selected={role === "option" ? selected : undefined}
      aria-checked={role === "menuitemradio" ? selected : undefined}
      onClick={onSelect}
      onMouseMove={focusOnPointerMove}
      className={cx(controls.popoverItem, styles.choice)}
    >
      <span>{children}</span>
      <CheckIcon size={18} className={styles.check} />
    </button>
  );
}
