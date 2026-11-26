export interface NavSection {
  count: number;
  columns: number;
}

/**
 * The number of columns in a laid-out grid, from its computed grid-template-columns (one length
 * per track, e.g. "312px 312px 312px"). Null when there's nothing to count: no layout ("" or
 * "none", as in jsdom) or an unresolved value such as "repeat(...)" on a hidden grid.
 */
export function countGridColumns(templateColumns: string): number | null {
  const value = templateColumns.trim();
  if (!value || value === "none" || value.includes("(")) return null;
  return value.split(/\s+/).length;
}

export function getNextIndex(
  sections: NavSection[],
  index: number,
  key: string,
): number | null {
  const total = sections.reduce((sum, s) => sum + s.count, 0);
  if (total === 0) return null;

  switch (key) {
    case "ArrowLeft":
      return Math.max(index - 1, 0);
    case "ArrowRight":
      return Math.min(index + 1, total - 1);
    case "Home":
      return 0;
    case "End":
      return total - 1;
    case "ArrowDown":
      return moveDown(sections, index);
    case "ArrowUp":
      return moveUp(sections, index);
    default:
      return null;
  }
}

interface Located {
  section: number;
  start: number;
  position: number;
  columns: number;
}

function locate(sections: NavSection[], index: number): Located {
  let start = 0;
  for (let section = 0; section < sections.length; section++) {
    const { count } = sections[section];
    if (index < start + count) {
      return {
        section,
        start,
        position: index - start,
        columns: columnsOf(sections[section]),
      };
    }
    start += count;
  }
  throw new RangeError(`Index ${index} is outside the sections`);
}

const columnsOf = (s: NavSection) => Math.max(1, s.columns);

const startOf = (sections: NavSection[], section: number) =>
  sections.slice(0, section).reduce((sum, s) => sum + s.count, 0);

function moveDown(sections: NavSection[], index: number): number {
  const { section, start, position, columns } = locate(sections, index);
  const { count } = sections[section];
  const row = Math.floor(position / columns);
  const lastRow = Math.floor((count - 1) / columns);

  if (row < lastRow) return start + Math.min(position + columns, count - 1);

  const next = sections.findIndex((s, i) => i > section && s.count > 0);
  if (next === -1) return index;

  const column = position % columns;
  const firstRowLength = Math.min(
    columnsOf(sections[next]),
    sections[next].count,
  );
  return startOf(sections, next) + Math.min(column, firstRowLength - 1);
}

function moveUp(sections: NavSection[], index: number): number {
  const { section, start, position, columns } = locate(sections, index);

  if (position >= columns) return start + position - columns;

  const previous = sections.findLastIndex((s, i) => i < section && s.count > 0);
  if (previous === -1) return index;

  const { count } = sections[previous];
  const previousColumns = columnsOf(sections[previous]);
  const lastRowStart =
    Math.floor((count - 1) / previousColumns) * previousColumns;
  const column = position % columns;
  return (
    startOf(sections, previous) + Math.min(lastRowStart + column, count - 1)
  );
}
