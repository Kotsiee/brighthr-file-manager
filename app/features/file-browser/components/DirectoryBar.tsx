import { KeyboardEvent, Ref, useImperativeHandle, useRef } from "react";
import { Breadcrumb } from "@/app/shared/utils/directory";
import styles from "./DirectoryBar.module.css";

export interface DirectoryBarHandle {
  focusParent: () => boolean;
  focusCurrent: () => void;
}

interface DirectoryBarProps {
  breadcrumbs: Breadcrumb[];
  /** Files only: folders aren't counted. */
  fileCount: number;
  onNavigate: (position: number) => void;
  onArrowDown?: () => void;
  ref?: Ref<DirectoryBarHandle>;
}

export default function DirectoryBar({
  breadcrumbs,
  fileCount,
  onNavigate,
  onArrowDown,
  ref,
}: DirectoryBarProps) {
  const crumbRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const currentRef = useRef<HTMLSpanElement>(null);
  const parentPosition = breadcrumbs.length - 2;

  useImperativeHandle(ref, () => ({
    focusParent: () => {
      const parent = crumbRefs.current[parentPosition];
      parent?.focus();
      return Boolean(parent);
    },
    focusCurrent: () => currentRef.current?.focus(),
  }));

  const handleKeyDown = (event: KeyboardEvent<HTMLButtonElement>, position: number) => {
    let target: number;
    if (event.key === "ArrowLeft") target = Math.max(position - 1, 0);
    else if (event.key === "ArrowRight") target = Math.min(position + 1, parentPosition);
    else if (event.key === "ArrowDown" && onArrowDown) {
      event.preventDefault();
      onArrowDown();
      return;
    } else return;

    event.preventDefault();
    crumbRefs.current[target]?.focus();
  };

  return (
    <div className={styles.bar}>
      <nav aria-label="Breadcrumb">
        <ol className={styles.trail}>
          {breadcrumbs.map((crumb, position) => {
            const isCurrent = position === breadcrumbs.length - 1;
            return (
              <li key={`${position}-${crumb.name}`} className={styles.crumb}>
                {position > 0 && (
                  <span aria-hidden="true" className={styles.separator}>
                    /
                  </span>
                )}
                {isCurrent ? (
                  <span
                    ref={currentRef}
                    tabIndex={-1}
                    aria-current="page"
                    className={styles.current}
                  >
                    {crumb.name}
                  </span>
                ) : (
                  <button
                    type="button"
                    ref={(el) => {
                      crumbRefs.current[position] = el;
                    }}
                    onClick={() => onNavigate(position)}
                    onKeyDown={(event) => handleKeyDown(event, position)}
                    className={styles.link}
                  >
                    {crumb.name}
                  </button>
                )}
              </li>
            );
          })}
        </ol>
      </nav>
      <p aria-live="polite" className={styles.count}>
        {fileCount} {fileCount === 1 ? "file" : "files"}
      </p>
    </div>
  );
}
