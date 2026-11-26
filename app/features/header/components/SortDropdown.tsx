import Dropdown from "@/app/shared/components/Dropdown";
import {
  SortAscendingIcon,
  SortDescendingIcon,
} from "@/app/shared/components/icons";
import { SortOrder, SortType } from "@/app/shared/utils/sort-files";
import {
  flipSortOrder,
  getSortOrderLabel,
  SORT_OPTIONS,
} from "../utils/sort-options";
import styles from "./SortDropdown.module.css";

interface SortDropdownProps {
  sortType: SortType;
  onSortTypeChange: (type: SortType) => void;
  sortOrder: SortOrder;
  onSortOrderChange: (order: SortOrder) => void;
}

export default function SortDropdown({
  sortType,
  onSortTypeChange,
  sortOrder,
  onSortOrderChange,
}: SortDropdownProps) {
  const current = getSortOrderLabel(sortType, sortOrder);
  const next = getSortOrderLabel(sortType, flipSortOrder(sortOrder));
  const DirectionIcon =
    sortOrder === "asc" ? SortAscendingIcon : SortDescendingIcon;

  return (
    <Dropdown
      label="Sort by"
      options={SORT_OPTIONS}
      value={sortType}
      onChange={onSortTypeChange}
      leading={
        <button
          type="button"
          aria-label={`Sort order: ${current}. Switch to ${next}`}
          title={`${current} (switch to ${next})`}
          onClick={() => onSortOrderChange(flipSortOrder(sortOrder))}
          className={styles.direction}
        >
          <DirectionIcon />
        </button>
      }
    />
  );
}
