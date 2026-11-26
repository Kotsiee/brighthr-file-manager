"use client";

import { KeyboardEvent, useRef, useState } from "react";
import { flushSync } from "react-dom";
import Dropdown from "@/app/shared/components/Dropdown";
import {
  ArrowLeftIcon,
  GridIcon,
  ListIcon,
  SearchIcon,
} from "@/app/shared/components/icons";
import Logo from "@/app/shared/components/Logo";
import controls from "@/app/shared/styles/controls.module.css";
import { otherViewMode } from "@/app/shared/utils/view-mode";
import MobileMenu from "./components/MobileMenu";
import SearchField from "./components/SearchField";
import SortDropdown from "./components/SortDropdown";
import { HeaderControls } from "./contracts/HeaderControls";
import styles from "./Header.module.css";

export default function Header(props: HeaderControls) {
  const { searchQuery, onSearchChange, viewMode, onViewModeChange } = props;

  const [isMobileSearchOpen, setIsMobileSearchOpen] = useState(false);
  const mobileInputRef = useRef<HTMLInputElement>(null);
  const mobileSearchButtonRef = useRef<HTMLButtonElement>(null);

  const nextView = otherViewMode(viewMode);
  const ViewIcon = nextView === "grid" ? GridIcon : ListIcon;

  const openMobileSearch = () => {
    flushSync(() => setIsMobileSearchOpen(true));
    mobileInputRef.current?.focus();
  };

  const closeMobileSearch = () => {
    onSearchChange("");
    flushSync(() => setIsMobileSearchOpen(false));
    mobileSearchButtonRef.current?.focus();
  };

  const handleMobileSearchKeyDown = (
    event: KeyboardEvent<HTMLInputElement>,
  ) => {
    if (event.key === "Escape") {
      event.preventDefault();
      closeMobileSearch();
    }
  };

  return (
    <header className={styles.header}>
      <div className={styles.inner}>
        <div data-testid="header-desktop" className={styles.desktop}>
          <Logo />
          <SearchField
            value={searchQuery}
            onChange={onSearchChange}
            className={styles.desktopSearch}
          />
          <div className={styles.desktopActions}>
            <button
              type="button"
              aria-label={`Switch to ${nextView} view`}
              title={`Switch to ${nextView} view`}
              onClick={() => onViewModeChange(nextView)}
              className={controls.ghostIconButton}
            >
              <ViewIcon />
            </button>
            <Dropdown
              label="Filter by type"
              options={props.fileTypeOptions}
              value={props.fileType}
              onChange={props.onFileTypeChange}
            />
            <SortDropdown
              sortType={props.sortType}
              onSortTypeChange={props.onSortTypeChange}
              sortOrder={props.sortOrder}
              onSortOrderChange={props.onSortOrderChange}
            />
          </div>
        </div>

        {/* Mobile */}
        <div data-testid="header-mobile" className={styles.mobile}>
          {isMobileSearchOpen ? (
            <>
              <button
                type="button"
                aria-label="Close search"
                onClick={closeMobileSearch}
                className={controls.ghostIconButton}
              >
                <ArrowLeftIcon />
              </button>
              <SearchField
                value={searchQuery}
                onChange={onSearchChange}
                inputRef={mobileInputRef}
                onKeyDown={handleMobileSearchKeyDown}
                className={styles.mobileSearch}
              />
            </>
          ) : (
            <>
              <Logo />
              <div className={styles.mobileActions}>
                <button
                  ref={mobileSearchButtonRef}
                  type="button"
                  aria-label="Search documents"
                  onClick={openMobileSearch}
                  className={controls.ghostIconButton}
                >
                  <SearchIcon />
                </button>
                <MobileMenu {...props} />
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
