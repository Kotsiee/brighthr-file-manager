"use client";

import { useState } from "react";
import FileBrowser from "@/app/features/file-browser/FileBrowser";
import Header from "@/app/features/header/Header";
import { FMFile } from "@/app/shared/contracts/FMFile";
import { ViewMode } from "@/app/shared/contracts/ViewMode";
import { FILE_TYPE_OPTIONS } from "@/app/shared/data/file-type-options";
import useFiles from "@/app/shared/hooks/useFiles";
import styles from "./FileManager.module.css";

export default function FileManager({ rawJson }: { rawJson: string }) {
  const {
    files,
    breadcrumbs,
    openFolder,
    navigateToBreadcrumb,
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
  const [selectedFile, setSelectedFile] = useState<FMFile | null>(null);

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

      <main className={styles.main}>
        <FileBrowser
          files={files}
          breadcrumbs={breadcrumbs}
          viewMode={viewMode}
          selectedFile={selectedFile}
          onOpenFolder={openFolder}
          onNavigateToBreadcrumb={navigateToBreadcrumb}
          onOpenFile={setSelectedFile}
        />
      </main>
    </>
  );
}
