import { useCallback, useMemo } from "react";
import { STORAGE_KEYS } from "../constants/storage-keys";
import { isFileTypeOption } from "../data/file-type-options";
import {
  enterFolder,
  getBreadcrumbs,
  getDirectory,
  goToBreadcrumb,
  goUp as goUpPath,
  isValidPath,
} from "../utils/directory";
import { filterFilesByType } from "../utils/filter-files";
import processFiles from "../utils/process-files";
import searchFiles from "../utils/search-files";
import sortFiles, {
  isSortOrder,
  isSortType,
  SortOrder,
  SortType,
} from "../utils/sort-files";
import usePersistentState from "./usePersistentState";

export interface UseFilesOptions {
  initialFileType?: string;
  initialSortType?: SortType;
  initialSortOrder?: SortOrder;
  persist?: boolean;
}

const isString = (value: unknown): value is string => typeof value === "string";

const isStringArray = (value: unknown): value is string[] =>
  Array.isArray(value) && value.every(isString);

const ROOT_PATH: string[] = [];

export default function useFiles(
  rawJson: string,
  {
    initialFileType = "all",
    initialSortType = "name",
    initialSortOrder = "asc",
    persist = false,
  }: UseFilesOptions = {},
) {
  const rootFiles = useMemo(() => processFiles(rawJson), [rawJson]);

  const storageKey = (name: keyof typeof STORAGE_KEYS) =>
    persist ? STORAGE_KEYS[name] : null;

  const isExistingPath = useCallback(
    (value: unknown): value is string[] =>
      isStringArray(value) && isValidPath(rootFiles, value),
    [rootFiles],
  );
  const [currentPath, setCurrentPath] = usePersistentState(
    storageKey("currentPath"),
    ROOT_PATH,
    isExistingPath,
  );

  const [searchQuery, setSearchQuery] = usePersistentState(
    storageKey("searchQuery"),
    "",
    isString,
  );
  const [fileType, setFileType] = usePersistentState(
    storageKey("fileType"),
    initialFileType,
    isFileTypeOption,
  );
  const [sortType, setSortType] = usePersistentState<SortType>(
    storageKey("sortType"),
    initialSortType,
    isSortType,
  );
  const [sortOrder, setSortOrder] = usePersistentState<SortOrder>(
    storageKey("sortOrder"),
    initialSortOrder,
    isSortOrder,
  );

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
    setCurrentPath(enterFolder(currentPath, folderName));
    setSearchQuery("");
  };

  const navigateToBreadcrumb = (index: number) => {
    setCurrentPath(goToBreadcrumb(currentPath, index));
  };

  const goUp = () => {
    setCurrentPath(goUpPath(currentPath));
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
