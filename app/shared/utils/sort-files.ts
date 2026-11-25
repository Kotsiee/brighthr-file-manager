import { FMFile } from "../contracts/FMFile";

export type SortType = "name" | "added";
export type SortOrder = "asc" | "desc";

export default function sortFiles(
  files: FMFile[],
  sortType: SortType,
  sortOrder: SortOrder = "asc",
): FMFile[] {
  const direction = sortOrder === "asc" ? 1 : -1;

  return [...files]
    .map((file) => {
      if (Array.isArray(file.files)) {
        return {
          ...file,
          files: sortFiles(file.files, sortType, sortOrder),
        };
      }
      return file;
    })
    .sort((a, b) => {
      // Keep folders pinned at the top regardless of sortOrder
      if (a.type === "folder" && b.type !== "folder") return -1;
      if (a.type !== "folder" && b.type === "folder") return 1;

      if (sortType === "added") {
        // Folders have no 'added' date; sort them alphabetically (respecting sortOrder, or remove `* direction` to keep folders A-Z)
        if (a.type === "folder" && b.type === "folder") {
          return a.name.localeCompare(b.name) * direction;
        }
        // Ascending = oldest first (a - b); Descending = newest first (b - a)
        return (
          (new Date(a.added!).getTime() - new Date(b.added!).getTime()) *
          direction
        );
      }

      return a.name.localeCompare(b.name) * direction;
    });
}
