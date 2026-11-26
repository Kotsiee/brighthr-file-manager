import cx from "../utils/cx";
import styles from "./FileTypeIcon.module.css";

const KNOWN_TYPES = new Set(["folder", "pdf", "doc", "csv", "mov"]);

interface FileTypeIconProps {
  type: string;
  muted?: boolean;
  className?: string;
}

export default function FileTypeIcon({
  type,
  muted,
  className,
}: FileTypeIconProps) {
  const known = KNOWN_TYPES.has(type);
  const mask = `url(/icons/${known ? type : "file"}.svg) center / contain no-repeat`;

  return (
    <span
      aria-hidden="true"
      data-type={known ? type : undefined}
      className={cx(styles.icon, muted && styles.muted, className)}
      style={{ mask, WebkitMask: mask }}
    />
  );
}
