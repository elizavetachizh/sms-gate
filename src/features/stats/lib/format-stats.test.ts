import { describe, expect, it } from "vitest";
import {
  formatDateLabel,
  formatFullDateLabel,
  getSeriesLabel,
} from "./format-stats";

describe("format-stats", () => {
  it("formats a short day-month label for chart axes", () => {
    expect(formatDateLabel("2026-06-01")).toBe(
      new Intl.DateTimeFormat("ru-RU", {
        day: "2-digit",
        month: "2-digit",
      }).format(new Date("2026-06-01T00:00:00")),
    );
  });

  it("formats a full date for tooltips and the table", () => {
    expect(formatFullDateLabel("2026-06-01")).toBe(
      new Intl.DateTimeFormat("ru-RU", {
        day: "2-digit",
        month: "long",
        year: "numeric",
      }).format(new Date("2026-06-01T00:00:00")),
    );
  });

  it("prefers provider name in the series label", () => {
    expect(
      getSeriesLabel({
        provider_name: "Fake",
        provider_code: "fake",
        status: "delivered",
      }),
    ).toBe("Fake / Доставлено");
  });

  it("falls back to provider code when name is missing", () => {
    expect(
      getSeriesLabel({
        provider_name: null,
        provider_code: "fake",
        status: "failed",
      }),
    ).toBe("fake / Ошибка");
  });
});
