import { Ref } from "react";
import { Breadcrumb } from "@/app/shared/utils/directory";
import styles from "./DirectoryBar.module.css";

interface DirectoryBarProps {
  breadcrumbs: Breadcrumb[];
  /** Files only: folders aren't counted. */
  fileCount: number;
  onNavigate: (position: number) => void;
  currentRef?: Ref<HTMLSpanElement>;
}

export default function DirectoryBar({
  breadcrumbs,
  fileCount,
  onNavigate,
  currentRef,
}: DirectoryBarProps) {
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
                    onClick={() => onNavigate(position)}
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
