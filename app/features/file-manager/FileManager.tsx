"use client";

import { useState } from "react";
import Header from "@/app/features/header/Header";
import { ViewMode } from "@/app/shared/contracts/ViewMode";
import { FILE_TYPE_OPTIONS } from "@/app/shared/data/file-type-options";
import useFiles from "@/app/shared/hooks/useFiles";
import styles from "./FileManager.module.css";

export default function FileManager({ rawJson }: { rawJson: string }) {
  const {
    files,
    searchQuery,
    setSearchQuery,
    fileType,
    setFileType,
    sortType,
    setSortType,
    sortOrder,
    setSortOrder,
  } = useFiles(rawJson, { initialSortType: "added", initialSortOrder: "desc" });

  const [viewMode, setViewMode] = useState<ViewMode>("list");

  return (
    <>
      <Header
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        fileType={fileType}
        fileTypeOptions={FILE_TYPE_OPTIONS}
        onFileTypeChange={setFileType}
        sortType={sortType}
        onSortTypeChange={setSortType}
        sortOrder={sortOrder}
        onSortOrderChange={setSortOrder}
        viewMode={viewMode}
        onViewModeChange={setViewMode}
      />

      {/*
        TEMPORARY placeholder so the header's search, filter, sort and view switch can be checked
        by eye and in tests
      */}
      <main className={styles.main}>
        <p className={styles.summary}>
          {files.length} items · {viewMode} view · {sortType} {sortOrder}
          {fileType !== "all" && ` · ${fileType} only`}
        </p>
        <ul aria-label="Documents" data-view={viewMode} className={styles.list}>
          {files.map((file, index) => (
            <li key={`${index}-${file.type}-${file.name}`} className={styles.item}>
              {file.name}
              <span className={styles.meta}>
                {" "}
                · {file.type}
                {file.added && ` · ${String(file.added)}`}
              </span>
            </li>
          ))}
        </ul>
      </main>
    </>
  );
}
