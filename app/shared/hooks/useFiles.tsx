import { useMemo, useState } from "react";
import {
  enterFolder,
  getBreadcrumbs,
  getDirectory,
  goToBreadcrumb,
  goUp as goUpPath,
} from "../utils/directory";
import { filterFilesByType } from "../utils/filter-files";
import processFiles from "../utils/process-files";
import searchFiles from "../utils/search-files";
import sortFiles, { SortOrder, SortType } from "../utils/sort-files";

export default function useFiles(rawJson: string) {
  const rootFiles = useMemo(() => processFiles(rawJson), [rawJson]);

  const [currentPath, setCurrentPath] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [fileType, setFileType] = useState<string>("all");
  const [sortType, setSortType] = useState<SortType>("name");
  const [sortOrder, setSortOrder] = useState<SortOrder>("asc");

  const currentDirectory = useMemo(
    () => getDirectory(rootFiles, currentPath),
    [rootFiles, currentPath],
  );

  const breadcrumbs = useMemo(() => getBreadcrumbs(currentPath), [currentPath]);

  const visibleFiles = useMemo(() => {
    let result = searchQuery.trim()
      ? searchFiles(currentDirectory, searchQuery)
      : currentDirectory;

    if (fileType !== "all") {
      result = filterFilesByType(result, fileType);
    }

    return sortFiles(result, sortType, sortOrder);
  }, [currentDirectory, searchQuery, fileType, sortType, sortOrder]);

  const openFolder = (folderName: string) => {
    setCurrentPath((prev) => enterFolder(prev, folderName));
    setSearchQuery("");
  };

  const navigateToBreadcrumb = (index: number) => {
    setCurrentPath((prev) => goToBreadcrumb(prev, index));
  };

  const goUp = () => {
    setCurrentPath((prev) => goUpPath(prev));
  };

  return {
    files: visibleFiles,
    currentPath,
    breadcrumbs,
    isAtRoot: currentPath.length === 0,
    searchQuery,
    setSearchQuery,
    fileType,
    setFileType,
    sortType,
    setSortType,
    sortOrder,
    setSortOrder,
    openFolder,
    navigateToBreadcrumb,
    goUp,
  };
}
