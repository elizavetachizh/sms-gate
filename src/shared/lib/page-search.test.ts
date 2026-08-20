import { describe, expect, it } from "vitest";
import type { MailingsSearch } from "@/features/mailings/search";
import { mergePageSearch } from "./page-search";

describe("mergePageSearch", () => {
  it("updates offset without touching limit", () => {
    const prev: MailingsSearch = {
      status: undefined,
      limit: 20,
      offset: 0,
    };

    expect(mergePageSearch(prev, { offset: 40 })).toEqual({
      status: undefined,
      limit: 20,
      offset: 40,
    });
  });

  it("resets offset when limit changes", () => {
    expect(
      mergePageSearch({ limit: 20, offset: 40 }, { limit: 50 }),
    ).toEqual({ limit: 50, offset: 0 });
  });

  it("keeps an explicit offset when limit also changes", () => {
    expect(
      mergePageSearch({ limit: 20, offset: 40 }, { limit: 50, offset: 100 }),
    ).toEqual({ limit: 50, offset: 100 });
  });

  it("keeps offset when other search fields change", () => {
    const prev: MailingsSearch = {
      status: undefined,
      limit: 20,
      offset: 20,
    };

    expect(mergePageSearch(prev, { status: "queued" })).toEqual({
      status: "queued",
      limit: 20,
      offset: 20,
    });
  });
});
