import { ComponentPropsWithRef } from "react";
import FileTypeIcon from "@/app/shared/components/FileTypeIcon";
import { FMFile } from "@/app/shared/contracts/FMFile";
import { ViewMode } from "@/app/shared/contracts/ViewMode";
import cx from "@/app/shared/utils/cx";
import styles from "./FolderCard.module.css";

type FolderCardProps = Omit<ComponentPropsWithRef<"button">, "children"> & {
  folder: FMFile;
  variant: ViewMode;
};

export default function FolderCard({
  folder,
  variant,
  className,
  ...buttonProps
}: FolderCardProps) {
  const count = folder.files?.length ?? 0;
  const countLabel = `${count} ${count === 1 ? "File" : "Files"}`;

  return (
    <button
      type="button"
      aria-label={`${folder.name}, folder, ${countLabel.toLowerCase()}`}
      title={folder.name}
      className={cx(styles.card, styles[variant], className)}
      {...buttonProps}
    >
      <FileTypeIcon type="folder" className={styles.icon} />
      <span className={styles.text}>
        <span className={styles.name}>{folder.name}</span>
        <span className={styles.count}>{countLabel}</span>
      </span>
    </button>
  );
}
