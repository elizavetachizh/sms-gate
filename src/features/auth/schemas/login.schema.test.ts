import { describe, expect, it } from "vitest";
import {
  LOGIN_PASSWORD_MAX_LENGTH,
  LOGIN_PASSWORD_MIN_LENGTH,
  loginFormSchema,
} from "./login.schema";

describe("loginFormSchema", () => {
  it("accepts valid credentials", () => {
    const result = loginFormSchema.safeParse({
      email: "user@example.com",
      password: "password123",
    });

    expect(result.success).toBe(true);
  });

  it("trims email", () => {
    const result = loginFormSchema.safeParse({
      email: "  user@example.com  ",
      password: "password123",
    });

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.email).toBe("user@example.com");
    }
  });

  it("rejects invalid email", () => {
    const result = loginFormSchema.safeParse({
      email: "not-an-email",
      password: "password123",
    });

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0]?.path).toEqual(["email"]);
    }
  });

  it("rejects password shorter than 8 characters", () => {
    const result = loginFormSchema.safeParse({
      email: "user@example.com",
      password: "a".repeat(LOGIN_PASSWORD_MIN_LENGTH - 1),
    });

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0]?.path).toEqual(["password"]);
    }
  });

  it("rejects password longer than 128 characters", () => {
    const result = loginFormSchema.safeParse({
      email: "user@example.com",
      password: "a".repeat(LOGIN_PASSWORD_MAX_LENGTH + 1),
    });

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0]?.path).toEqual(["password"]);
    }
  });
});
