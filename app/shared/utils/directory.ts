import { FMFile } from "../contracts/FMFile";

export interface Breadcrumb {
  name: string;
  index: number;
}

export const ROOT_BREADCRUMB_NAME = "Documents";

export function getDirectory(root: FMFile[], path: string[]): FMFile[] {
  let dir = root;

  for (const folderName of path) {
    const folder = findFolder(dir, folderName);
    if (!folder) return [];
    dir = folder.files ?? [];
  }

  return dir;
}

export function isValidPath(root: FMFile[], path: string[]): boolean {
  let dir = root;

  for (const folderName of path) {
    const folder = findFolder(dir, folderName);
    if (!folder) return false;
    dir = folder.files ?? [];
  }

  return true;
}

export function getBreadcrumbs(path: string[]): Breadcrumb[] {
  return [
    { name: ROOT_BREADCRUMB_NAME, index: -1 },
    ...path.map((name, index) => ({ name, index })),
  ];
}

export function enterFolder(path: string[], folderName: string): string[] {
  return [...path, folderName];
}

export function goToBreadcrumb(path: string[], index: number): string[] {
  return path.slice(0, Math.max(index + 1, 0));
}

export function goUp(path: string[]): string[] {
  return path.slice(0, -1);
}

function findFolder(dir: FMFile[], name: string): FMFile | undefined {
  return dir.find((f) => f.type === "folder" && f.name === name);
}
