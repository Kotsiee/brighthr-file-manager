import cx from "../utils/cx";
import styles from "./Logo.module.css";

const mask = "url(/logo.svg) center / contain no-repeat";

export default function Logo({ className }: { className?: string }) {
  return (
    <span
      role="img"
      aria-label="BrightHR"
      className={cx(styles.logo, className)}
      style={{ mask, WebkitMask: mask }}
    />
  );
}
