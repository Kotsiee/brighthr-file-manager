import { useMemo, useState, useSyncExternalStore } from "react";
import { StorageKey } from "../constants/storage-keys";
import { parseStored, readStorage, writeStorage } from "../utils/storage";

const subscribe = () => () => {};

export default function usePersistentState<T>(
  key: StorageKey | null,
  defaultValue: T,
  isValid: (value: unknown) => value is T,
): [T, (value: T) => void] {
  const raw = useSyncExternalStore(
    subscribe,
    () => (key ? readStorage(key) : null),
    () => null,
  );
  const stored = useMemo(() => parseStored(raw, isValid), [raw, isValid]);

  const [local, setLocal] = useState<{ value: T } | null>(null);

  const setValue = (value: T) => {
    setLocal({ value });
    if (key) writeStorage(key, value);
  };

  return [local ? local.value : (stored ?? defaultValue), setValue];
}
