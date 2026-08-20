import { describe, expect, it } from "vitest";
import { getApiBaseUrl } from "./config";

describe("getApiBaseUrl", () => {
  it("defaults to /api/v1 when VITE_API_BASE_URL is unset", () => {
    expect(getApiBaseUrl()).toBe("/api/v1");
  });
});
