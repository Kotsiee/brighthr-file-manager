import { FormEvent, KeyboardEvent, RefObject, useId, useRef } from "react";
import { SearchIcon } from "@/app/shared/components/icons";
import controls from "@/app/shared/styles/controls.module.css";
import cx from "@/app/shared/utils/cx";
import styles from "./SearchField.module.css";

interface SearchFieldProps {
  value: string;
  onChange: (value: string) => void;
  inputRef?: RefObject<HTMLInputElement | null>;
  onKeyDown?: (event: KeyboardEvent<HTMLInputElement>) => void;
  className?: string;
}

export default function SearchField({
  value,
  onChange,
  inputRef,
  onKeyDown,
  className,
}: SearchFieldProps) {
  const id = useId();
  const ownRef = useRef<HTMLInputElement>(null);
  const ref = inputRef ?? ownRef;

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    if (value.trim()) ref.current?.blur();
    else ref.current?.focus();
  };

  return (
    <form
      role="search"
      onSubmit={handleSubmit}
      className={cx(controls.borderedControl, styles.field, className)}
    >
      <label htmlFor={id} className="visually-hidden">
        Search documents
      </label>
      <input
        ref={ref}
        id={id}
        type="search"
        enterKeyHint="search"
        autoComplete="off"
        placeholder="Search documents..."
        value={value}
        onChange={(event) => onChange(event.target.value)}
        onKeyDown={onKeyDown}
        className={styles.input}
      />
      <button type="submit" aria-label="Search" className={styles.submit}>
        <SearchIcon />
      </button>
    </form>
  );
}
