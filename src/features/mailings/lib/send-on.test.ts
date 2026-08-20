import { describe, expect, it } from "vitest";
import { toDatetimeLocalValue, toMailingSendOnIso } from "./send-on";

describe("toMailingSendOnIso", () => {
  it("returns null for empty, null and whitespace", () => {
    expect(toMailingSendOnIso(undefined)).toBeNull();
    expect(toMailingSendOnIso(null)).toBeNull();
    expect(toMailingSendOnIso("")).toBeNull();
    expect(toMailingSendOnIso("   ")).toBeNull();
  });

  it("round-trips ISO through datetime-local", () => {
    const iso = "2026-08-20T12:30:00.000Z";

    expect(toMailingSendOnIso(toDatetimeLocalValue(iso))).toBe(iso);
  });
});
