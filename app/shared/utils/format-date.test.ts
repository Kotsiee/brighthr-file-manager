import { describe, expect, it } from "vitest";
import { formatDate, toISODate } from "./format-date";

describe("formatDate", () => {
  it("formats a calendar date as DD/MM/YYYY", () => {
    expect(formatDate("2017-01-06")).toBe("06/01/2017");
    expect(formatDate(new Date("2016-12-25"))).toBe("25/12/2016");
  });

  it("returns an empty string for a missing or invalid date", () => {
    expect(formatDate(undefined)).toBe("");
    expect(formatDate("not a date")).toBe("");
  });
});

describe("toISODate", () => {
  it("gives the machine-readable date, or undefined", () => {
    expect(toISODate("2017-01-06")).toBe("2017-01-06");
    expect(toISODate(undefined)).toBeUndefined();
  });
});
