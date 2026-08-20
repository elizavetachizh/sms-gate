import { describe, expect, it } from "vitest";
import { hasCredentials, setCredentials } from "./credentials-storage";

describe("hasCredentials", () => {
  it("is false when nothing is stored", () => {
    expect(hasCredentials()).toBe(false);
  });

  it("is true after credentials are saved", () => {
    setCredentials({ email: "user@example.com", password: "password123" });

    expect(hasCredentials()).toBe(true);
  });
});
