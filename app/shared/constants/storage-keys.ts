const PREFIX = "file-manager";

export const STORAGE_KEYS = {
  currentPath: `${PREFIX}:current-path`,
  searchQuery: `${PREFIX}:search-query`,
  fileType: `${PREFIX}:file-type`,
  sortType: `${PREFIX}:sort-type`,
  sortOrder: `${PREFIX}:sort-order`,
  viewMode: `${PREFIX}:view-mode`,
} as const;

export type StorageKey = (typeof STORAGE_KEYS)[keyof typeof STORAGE_KEYS];
