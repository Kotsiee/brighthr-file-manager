"use client";

import { useState } from "react";
import FileBrowser from "@/app/features/file-browser/FileBrowser";
import Header from "@/app/features/header/Header";
import { STORAGE_KEYS } from "@/app/shared/constants/storage-keys";
import { FMFile } from "@/app/shared/contracts/FMFile";
import { ViewMode } from "@/app/shared/contracts/ViewMode";
import { FILE_TYPE_OPTIONS } from "@/app/shared/data/file-type-options";
import useDocumentTitle from "@/app/shared/hooks/useDocumentTitle";
import useFiles from "@/app/shared/hooks/useFiles";
import usePersistentState from "@/app/shared/hooks/usePersistentState";
import { ROOT_BREADCRUMB_NAME } from "@/app/shared/utils/directory";
import { pageTitle } from "@/app/shared/utils/page-title";
import { isViewMode } from "@/app/shared/utils/view-mode";
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
  } = useFiles(rawJson, {
    initialSortType: "added",
    initialSortOrder: "desc",
    persist: true,
  });

  const [viewMode, setViewMode] = usePersistentState<ViewMode>(
    STORAGE_KEYS.viewMode,
    "list",
    isViewMode,
  );
  const [selectedFile, setSelectedFile] = useState<FMFile | null>(null);

  useDocumentTitle(pageTitle(breadcrumbs.at(-1)?.name ?? ROOT_BREADCRUMB_NAME));

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
