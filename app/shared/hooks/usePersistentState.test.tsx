import { act, render, renderHook, screen } from "@testing-library/react";
import { renderToString } from "react-dom/server";
import { afterEach, describe, expect, it, vi } from "vitest";
import { STORAGE_KEYS } from "../constants/storage-keys";
import { isViewMode } from "../utils/view-mode";
import usePersistentState from "./usePersistentState";

const key = STORAGE_KEYS.viewMode;
const store = (value: string) => window.localStorage.setItem(key, value);

const setup = (storageKey: typeof key | null = key) =>
  renderHook(() => usePersistentState(storageKey, "list", isViewMode));

afterEach(() => vi.restoreAllMocks());

describe("usePersistentState", () => {
  it("uses the default when nothing is stored", () => {
    expect(setup().result.current[0]).toBe("list");
  });

  it("restores a stored value", () => {
    store('"grid"');
    expect(setup().result.current[0]).toBe("grid");
  });

  it("falls back to the default for a corrupted or unknown stored value", () => {
    store("{oops");
    expect(setup().result.current[0]).toBe("list");

    store('"table"');
    expect(setup().result.current[0]).toBe("list");
  });

  it("stores the new value when it changes", () => {
    const { result } = setup();

    act(() => result.current[1]("grid"));

    expect(result.current[0]).toBe("grid");
    expect(window.localStorage.getItem(key)).toBe('"grid"');
  });

  it("keeps working in memory when storage is unavailable", () => {
    vi.spyOn(Storage.prototype, "getItem").mockImplementation(() => {
      throw new DOMException("Access denied", "SecurityError");
    });
    vi.spyOn(Storage.prototype, "setItem").mockImplementation(() => {
      throw new DOMException("Access denied", "SecurityError");
    });
    const { result } = setup();

    expect(result.current[0]).toBe("list");
    act(() => result.current[1]("grid"));
    expect(result.current[0]).toBe("grid");
  });

  it("leaves storage alone without a key", () => {
    store('"grid"');
    const { result } = setup(null);

    expect(result.current[0]).toBe("list");
    act(() => result.current[1]("list"));
    expect(window.localStorage.getItem(key)).toBe('"grid"');
  });

  it("hydrates server HTML with the default, then shows the stored value without a mismatch", async () => {
    function View() {
      const [mode] = usePersistentState(key, "list", isViewMode);
      return <p>{mode}</p>;
    }

    // The server can't see localStorage, so it renders the default.
    const html = renderToString(<View />);
    expect(html).toContain("list");

    store('"grid"');
    const container = document.createElement("div");
    container.innerHTML = html;
    document.body.appendChild(container);
    const consoleError = vi.spyOn(console, "error");

    await act(async () => {
      render(<View />, { container, hydrate: true });
    });

    expect(screen.getByText("grid")).toBeInTheDocument();
    expect(consoleError).not.toHaveBeenCalled();
  });
});
