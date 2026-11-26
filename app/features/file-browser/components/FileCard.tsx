import { ComponentPropsWithRef } from "react";
import FileTypeIcon from "@/app/shared/components/FileTypeIcon";
import { FMFile } from "@/app/shared/contracts/FMFile";
import { ViewMode } from "@/app/shared/contracts/ViewMode";
import cx from "@/app/shared/utils/cx";
import { formatDate, toISODate } from "@/app/shared/utils/format-date";
import styles from "./FileCard.module.css";

type FileCardProps = Omit<ComponentPropsWithRef<"button">, "children"> & {
  file: FMFile;
  variant: ViewMode;
  selected?: boolean;
};

export default function FileCard({
  file,
  variant,
  selected = false,
  className,
  ...buttonProps
}: FileCardProps) {
  const extension = `.${file.type}`;
  const date = formatDate(file.added);
  const label = [
    file.name,
    `${file.type.toUpperCase()} file (${extension})`,
    date && `added ${date}`,
  ]
    .filter(Boolean)
    .join(", ");

  const name = <span className={styles.name}>{file.name}</span>;
  const tag = <span className={styles.tag}>{extension}</span>;
  const dateText = date && (
    <time dateTime={toISODate(file.added)} className={styles.date}>
      {date}
    </time>
  );

  return (
    <button
      type="button"
      aria-label={label}
      aria-current={selected ? "true" : undefined}
      title={file.name}
      className={cx(styles.card, styles[variant], className)}
      {...buttonProps}
    >
      {variant === "grid" ? (
        <>
          <span className={styles.preview}>
            <FileTypeIcon
              type={file.type}
              muted
              className={styles.previewIcon}
            />
          </span>
          <span className={styles.details}>
            <span className={styles.titleRow}>
              <FileTypeIcon type={file.type} className={styles.smallIcon} />
              {name}
              {tag}
            </span>
            {dateText}
          </span>
        </>
      ) : (
        <>
          <FileTypeIcon type={file.type} className={styles.listIcon} />
          <span className={styles.body}>
            {name}
            {tag}
          </span>
          {dateText}
        </>
      )}
    </button>
  );
}
