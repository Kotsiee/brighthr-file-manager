import { StorageKey } from "../constants/storage-keys";

export function readStorage(key: StorageKey): string | null {
  try {
    return window.localStorage.getItem(key);
  } catch {
    return null;
  }
}

export function writeStorage(key: StorageKey, value: unknown): boolean {
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
    return true;
  } catch {
    return false;
  }
}

export function parseStored<T>(
  raw: string | null,
  isValid: (value: unknown) => value is T,
): T | undefined {
  if (raw === null) return undefined;
  try {
    const value: unknown = JSON.parse(raw);
    return isValid(value) ? value : undefined;
  } catch {
    return undefined;
  }
}
