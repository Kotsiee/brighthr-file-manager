import { ReactNode, useId } from "react";
import { ChevronDownIcon } from "@/app/shared/components/icons";
import {
  PopoverChoice,
  PopoverPanel,
} from "@/app/shared/components/popover/Popover";
import { Option } from "@/app/shared/contracts/Option";
import usePopover from "@/app/shared/hooks/usePopover";
import controls from "@/app/shared/styles/controls.module.css";
import cx from "@/app/shared/utils/cx";
import styles from "./Dropdown.module.css";

interface DropdownProps<T extends string> {
  label: string;
  options: Option<T>[];
  value: T;
  onChange: (value: T) => void;
  leading?: ReactNode;
}

export default function Dropdown<T extends string>({
  label,
  options,
  value,
  onChange,
  leading,
}: DropdownProps<T>) {
  const listId = useId();
  const {
    close,
    isOpen,
    onPanelKeyDown,
    onTriggerKeyDown,
    panelRef,
    rootRef,
    toggle,
    triggerRef,
  } = usePopover();
  const selected =
    options.find((option) => option.value === value) ?? options[0];

  const select = (next: T) => {
    onChange(next);
    close();
  };

  return (
    <div ref={rootRef} className={styles.root}>
      <div
        className={cx(
          controls.borderedControl,
          styles.control,
          leading != null && styles.hasLeading,
        )}
      >
        {leading}
        <button
          ref={triggerRef}
          type="button"
          aria-label={`${label}: ${selected?.label}`}
          aria-haspopup="listbox"
          aria-expanded={isOpen}
          aria-controls={isOpen ? listId : undefined}
          onClick={toggle}
          onKeyDown={onTriggerKeyDown}
          className={styles.trigger}
        >
          <span className={styles.label}>{selected?.label}</span>
          <ChevronDownIcon size={18} className={styles.chevron} />
        </button>
      </div>

      {isOpen && (
        <PopoverPanel
          ref={panelRef}
          id={listId}
          role="listbox"
          aria-label={label}
          onKeyDown={onPanelKeyDown}
        >
          {options.map((option) => (
            <PopoverChoice
              key={option.value}
              role="option"
              selected={option.value === value}
              onSelect={() => select(option.value)}
            >
              {option.label}
            </PopoverChoice>
          ))}
        </PopoverPanel>
      )}
    </div>
  );
}
