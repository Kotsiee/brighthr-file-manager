"use client";

import { KeyboardEvent, useEffect, useMemo, useRef, useState } from "react";
import { FMFile } from "@/app/shared/contracts/FMFile";
import { ViewMode } from "@/app/shared/contracts/ViewMode";
import { Breadcrumb } from "@/app/shared/utils/directory";
import DirectoryBar from "./components/DirectoryBar";
import FileCard from "./components/FileCard";
import FolderCard from "./components/FolderCard";
import styles from "./FileBrowser.module.css";
import { countGridColumns, getNextIndex, NavSection } from "./utils/grid-navigation";

export interface FileBrowserProps {
  files: FMFile[];
  breadcrumbs: Breadcrumb[];
  viewMode: ViewMode;
  selectedFile?: FMFile | null;
  onOpenFolder: (folderName: string) => void;
  onNavigateToBreadcrumb: (index: number) => void;
  onOpenFile?: (file: FMFile) => void;
}

/**
 * How many cards the CSS fits in a row right now. Read when a key is pressed rather than tracked,
 * so it is always current after a resize. Falls back to one column when there's no layout.
 */
const measureColumns = (grid: HTMLElement | null) =>
  (grid && countGridColumns(window.getComputedStyle(grid).gridTemplateColumns)) ?? 1;

const isFolder = (file: FMFile) => file.type === "folder";
const itemKey = (file: FMFile) => `${file.type}:${file.name}`;

export default function FileBrowser({
  files,
  breadcrumbs,
  viewMode,
  selectedFile,
  onOpenFolder,
  onNavigateToBreadcrumb,
  onOpenFile,
}: FileBrowserProps) {
  const { folders, documents, items } = useMemo(() => {
    const folders = files.filter(isFolder);
    const documents = files.filter((f) => !isFolder(f));
    return { folders, documents, items: [...folders, ...documents] };
  }, [files]);

  const [activeKey, setActiveKey] = useState<string | null>(null);
  const activeIndex = Math.max(
    0,
    items.findIndex((f) => itemKey(f) === activeKey),
  );

  const itemRefs = useRef<(HTMLButtonElement | null)[]>([]);
  // The card grid: every card in grid view, the folders in list view.
  const gridRef = useRef<HTMLUListElement>(null);
  const currentCrumbRef = useRef<HTMLSpanElement>(null);
  const focusAfterNavigation = useRef(false);

  useEffect(() => {
    if (!focusAfterNavigation.current) return;
    focusAfterNavigation.current = false;
    (itemRefs.current[activeIndex] ?? currentCrumbRef.current)?.focus();
  }, [items, activeIndex]);

  const openFolder = (folder: FMFile) => {
    focusAfterNavigation.current = true;
    setActiveKey(null);
    onOpenFolder(folder.name);
  };

  const navigateToBreadcrumb = (position: number) => {
    const leaving = breadcrumbs[position + 1];
    focusAfterNavigation.current = true;
    setActiveKey(leaving ? itemKey({ type: "folder", name: leaving.name }) : null);
    onNavigateToBreadcrumb(breadcrumbs[position].index);
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLButtonElement>, index: number) => {
    const columns = measureColumns(gridRef.current);
    const sections: NavSection[] =
      viewMode === "grid"
        ? [{ count: items.length, columns }]
        : [
            { count: folders.length, columns },
            { count: documents.length, columns: 1 },
          ];

    const next = getNextIndex(sections, index, event.key);
    if (next === null) return;
    event.preventDefault();
    itemRefs.current[next]?.focus();
  };

  const itemProps = (file: FMFile, index: number) => ({
    variant: viewMode,
    tabIndex: index === activeIndex ? 0 : -1,
    ref: (el: HTMLButtonElement | null) => {
      itemRefs.current[index] = el;
    },
    onFocus: () => setActiveKey(itemKey(file)),
    onKeyDown: (event: KeyboardEvent<HTMLButtonElement>) => handleKeyDown(event, index),
  });

  const renderItem = (file: FMFile, index: number) => (
    <li key={`${index}-${itemKey(file)}`}>
      {isFolder(file) ? (
        <FolderCard folder={file} onClick={() => openFolder(file)} {...itemProps(file, index)} />
      ) : (
        <FileCard
          file={file}
          selected={file === selectedFile}
          onClick={() => onOpenFile?.(file)}
          {...itemProps(file, index)}
        />
      )}
    </li>
  );

  const currentFolder = breadcrumbs.at(-1)?.name ?? "";

  return (
    <section aria-label={currentFolder} className={styles.browser}>
      <DirectoryBar
        breadcrumbs={breadcrumbs}
        fileCount={documents.length}
        onNavigate={navigateToBreadcrumb}
        currentRef={currentCrumbRef}
      />

      {items.length === 0 ? (
        <p className={styles.empty}>No documents here.</p>
      ) : viewMode === "grid" ? (
        <ul ref={gridRef} role="list" aria-label="Folders and files" className={styles.grid}>
          {items.map(renderItem)}
        </ul>
      ) : (
        <>
          {folders.length > 0 && (
            <ul ref={gridRef} role="list" aria-label="Folders" className={styles.grid}>
              {folders.map(renderItem)}
            </ul>
          )}
          {documents.length > 0 && (
            <ul role="list" aria-label="Files" className={styles.rows}>
              {documents.map((file, i) => renderItem(file, folders.length + i))}
            </ul>
          )}
        </>
      )}
    </section>
  );
}
