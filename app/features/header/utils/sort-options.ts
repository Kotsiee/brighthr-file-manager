import { Option } from "@/app/shared/contracts/Option";
import { SortOrder, SortType } from "@/app/shared/utils/sort-files";

export const SORT_OPTIONS: Option<SortType>[] = [
  { value: "added", label: "Date Added" },
  { value: "name", label: "Name" },
];

/** Human wording for a direction, which depends on what is being sorted. */
export function getSortOrderLabel(type: SortType, order: SortOrder): string {
  if (type === "added") return order === "asc" ? "Oldest first" : "Newest first";
  return order === "asc" ? "A to Z" : "Z to A";
}

export const flipSortOrder = (order: SortOrder): SortOrder =>
  order === "asc" ? "desc" : "asc";
