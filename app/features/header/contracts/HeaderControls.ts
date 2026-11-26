import { Option } from "@/app/shared/contracts/Option";
import { ViewMode } from "@/app/shared/contracts/ViewMode";
import { SortOrder, SortType } from "@/app/shared/utils/sort-files";

export interface HeaderControls {
  searchQuery: string;
  onSearchChange: (query: string) => void;

  fileType: string;
  fileTypeOptions: Option[];
  onFileTypeChange: (type: string) => void;

  sortType: SortType;
  onSortTypeChange: (type: SortType) => void;
  sortOrder: SortOrder;
  onSortOrderChange: (order: SortOrder) => void;

  viewMode: ViewMode;
  onViewModeChange: (mode: ViewMode) => void;
}
