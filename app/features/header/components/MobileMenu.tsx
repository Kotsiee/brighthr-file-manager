import { KeyboardEvent, ReactNode, useId, useState } from "react";
import {
  ArrowLeftIcon,
  ChevronRightIcon,
  GridIcon,
  KebabIcon,
  ListIcon,
} from "@/app/shared/components/icons";
import { PopoverChoice, PopoverPanel } from "@/app/shared/components/popover/Popover";
import usePopover from "@/app/shared/hooks/usePopover";
import controls from "@/app/shared/styles/controls.module.css";
import { FocusTarget, focusOnPointerMove } from "@/app/shared/utils/popover-focus";
import { SortOrder } from "@/app/shared/utils/sort-files";
import { otherViewMode, VIEW_MODE_LABELS } from "@/app/shared/utils/view-mode";
import { HeaderControls } from "../contracts/HeaderControls";
import { getSortOrderLabel, SORT_OPTIONS } from "../utils/sort-options";
import styles from "./MobileMenu.module.css";

type MobileMenuProps = Omit<HeaderControls, "searchQuery" | "onSearchChange">;
type View = "root" | "sort" | "filter";

const ORDERS: SortOrder[] = ["asc", "desc"];
const VIEW_TITLES: Record<View, string> = {
  root: "More options",
  sort: "Sort",
  filter: "Filter",
};

function MenuItem({
  children,
  onClick,
  item,
}: {
  children: ReactNode;
  onClick: () => void;
  item?: string;
}) {
  return (
    <button
      type="button"
      role="menuitem"
      tabIndex={-1}
      data-item={item}
      onClick={onClick}
      onMouseMove={focusOnPointerMove}
      className={controls.popoverItem}
    >
      {children}
    </button>
  );
}

function GroupHeading({ children }: { children: ReactNode }) {
  return (
    <div aria-hidden="true" className={styles.groupHeading}>
      {children}
    </div>
  );
}

const Separator = () => <div role="separator" className={styles.separator} />;

export default function MobileMenu({
  fileType,
  fileTypeOptions,
  onFileTypeChange,
  sortType,
  onSortTypeChange,
  sortOrder,
  onSortOrderChange,
  viewMode,
  onViewModeChange,
}: MobileMenuProps) {
  const menuId = useId();
  const {
    close,
    focusAfterRender,
    isOpen,
    onPanelKeyDown,
    onTriggerKeyDown,
    panelRef,
    rootRef,
    toggle,
    triggerRef,
  } = usePopover();
  const [view, setView] = useState<View>("root");

  const nextView = otherViewMode(viewMode);
  const ViewIcon = nextView === "grid" ? GridIcon : ListIcon;
  const sortLabel = SORT_OPTIONS.find((o) => o.value === sortType)?.label;
  const filterLabel = fileTypeOptions.find((o) => o.value === fileType)?.label;

  const goTo = (next: View, focus: FocusTarget) => {
    focusAfterRender(focus);
    setView(next);
  };

  const choose = (apply: () => void) => {
    apply();
    close();
  };

  const handleTriggerClick = () => {
    setView("root");
    toggle();
  };

  const handleTriggerKeyDown = (event: KeyboardEvent<HTMLButtonElement>) => {
    if (!isOpen) setView("root");
    onTriggerKeyDown(event);
  };

  const back = (from: View) => (
    <>
      <MenuItem onClick={() => goTo("root", { selector: `[data-item="${from}"]` })}>
        <ArrowLeftIcon size={18} className={styles.icon} />
        <span>Back</span>
      </MenuItem>
      <Separator />
    </>
  );

  return (
    <div ref={rootRef} className={styles.root}>
      <button
        ref={triggerRef}
        type="button"
        aria-label="More options"
        aria-haspopup="menu"
        aria-expanded={isOpen}
        aria-controls={isOpen ? menuId : undefined}
        onClick={handleTriggerClick}
        onKeyDown={handleTriggerKeyDown}
        className={controls.ghostIconButton}
      >
        <KebabIcon />
      </button>

      {isOpen && (
        <PopoverPanel
          ref={panelRef}
          id={menuId}
          role="menu"
          aria-label={VIEW_TITLES[view]}
          onKeyDown={onPanelKeyDown}
          className={styles.panel}
        >
          {view === "root" && (
            <>
              <MenuItem item="sort" onClick={() => goTo("sort", "selected")}>
                <span>Sort</span>
                <span className={styles.value}>{sortLabel}</span>
                <ChevronRightIcon size={18} className={styles.icon} />
              </MenuItem>
              <MenuItem item="filter" onClick={() => goTo("filter", "selected")}>
                <span>Filter</span>
                <span className={styles.value}>{filterLabel}</span>
                <ChevronRightIcon size={18} className={styles.icon} />
              </MenuItem>
              <Separator />
              <MenuItem onClick={() => choose(() => onViewModeChange(nextView))}>
                <ViewIcon size={18} className={styles.icon} />
                <span>Switch to {VIEW_MODE_LABELS[nextView]} View</span>
              </MenuItem>
            </>
          )}

          {view === "sort" && (
            <>
              {back("sort")}
              <div role="group" aria-label="Sort by">
                <GroupHeading>Sort by</GroupHeading>
                {SORT_OPTIONS.map((option) => (
                  <PopoverChoice
                    key={option.value}
                    role="menuitemradio"
                    selected={option.value === sortType}
                    onSelect={() => choose(() => onSortTypeChange(option.value))}
                  >
                    {option.label}
                  </PopoverChoice>
                ))}
              </div>
              <div role="group" aria-label="Order">
                <GroupHeading>Order</GroupHeading>
                {ORDERS.map((order) => (
                  <PopoverChoice
                    key={order}
                    role="menuitemradio"
                    selected={order === sortOrder}
                    onSelect={() => choose(() => onSortOrderChange(order))}
                  >
                    {getSortOrderLabel(sortType, order)}
                  </PopoverChoice>
                ))}
              </div>
            </>
          )}

          {view === "filter" && (
            <>
              {back("filter")}
              <div role="group" aria-label="Filter by type">
                {fileTypeOptions.map((option) => (
                  <PopoverChoice
                    key={option.value}
                    role="menuitemradio"
                    selected={option.value === fileType}
                    onSelect={() => choose(() => onFileTypeChange(option.value))}
                  >
                    {option.label}
                  </PopoverChoice>
                ))}
              </div>
            </>
          )}
        </PopoverPanel>
      )}
    </div>
  );
}
