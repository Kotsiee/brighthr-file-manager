import { afterEach, describe, expect, it, vi } from "vitest";
import { STORAGE_KEYS } from "../constants/storage-keys";
import { isSortOrder } from "./sort-files";
import { parseStored, readStorage, writeStorage } from "./storage";

const key = STORAGE_KEYS.sortOrder;

afterEach(() => vi.restoreAllMocks());

describe("readStorage / writeStorage", () => {
  it("round-trips a value as JSON", () => {
    expect(writeStorage(key, "desc")).toBe(true);
    expect(window.localStorage.getItem(key)).toBe('"desc"');
    expect(readStorage(key)).toBe('"desc"');
  });

  it("reads nothing when storage is blocked", () => {
    vi.spyOn(Storage.prototype, "getItem").mockImplementation(() => {
      throw new DOMException("Access denied", "SecurityError");
    });
    expect(readStorage(key)).toBeNull();
  });

  it("reports a failed write instead of throwing when storage is full", () => {
    vi.spyOn(Storage.prototype, "setItem").mockImplementation(() => {
      throw new DOMException("Quota exceeded", "QuotaExceededError");
    });
    expect(writeStorage(key, "desc")).toBe(false);
  });
});

describe("parseStored", () => {
  it("returns a stored value that passes validation", () => {
    expect(parseStored('"asc"', isSortOrder)).toBe("asc");
  });

  it("ignores missing, malformed and unexpected values", () => {
    expect(parseStored(null, isSortOrder)).toBeUndefined();
    expect(parseStored("{not json", isSortOrder)).toBeUndefined();
    expect(parseStored('"sideways"', isSortOrder)).toBeUndefined();
    expect(parseStored("42", isSortOrder)).toBeUndefined();
  });
});
