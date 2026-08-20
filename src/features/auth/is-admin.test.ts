import { describe, expect, it } from "vitest";
import { adminFixture, userFixture } from "@/test/fixtures";
import { isAdmin } from "./is-admin";

describe("isAdmin", () => {
  it("returns true for admin", () => {
    expect(isAdmin(adminFixture)).toBe(true);
  });

  it("returns false for user", () => {
    expect(isAdmin(userFixture)).toBe(false);
  });

  it("returns false without a user", () => {
    expect(isAdmin(undefined)).toBe(false);
    expect(isAdmin(null)).toBe(false);
  });
});
