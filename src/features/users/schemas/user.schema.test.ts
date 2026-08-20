import { describe, expect, it } from "vitest";
import { LOGIN_PASSWORD_MAX_LENGTH } from "@/features/auth/schemas/login.schema";
import {
  USER_PASSWORD_MIN_LENGTH,
  toUserCreatePayload,
  userChangePasswordFormSchema,
  userCreateFormSchema,
  userEditFormSchema,
} from "./user.schema";

const validCreateValues = {
  email: "new@example.com",
  password: "password123",
  name: "New",
  role: "user",
  is_active: true,
};

describe("userCreateFormSchema", () => {
  it("accepts a valid user", () => {
    const result = userCreateFormSchema.safeParse(validCreateValues);

    expect(result.success).toBe(true);
  });

  it("trims email and name", () => {
    const result = userCreateFormSchema.safeParse({
      ...validCreateValues,
      email: "  new@example.com  ",
      name: "  New  ",
    });

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.email).toBe("new@example.com");
      expect(result.data.name).toBe("New");
    }
  });

  it("rejects invalid email", () => {
    const result = userCreateFormSchema.safeParse({
      ...validCreateValues,
      email: "not-an-email",
    });

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0]?.path).toEqual(["email"]);
    }
  });

  it("rejects a short password", () => {
    const result = userCreateFormSchema.safeParse({
      ...validCreateValues,
      password: "a".repeat(USER_PASSWORD_MIN_LENGTH - 1),
    });

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0]?.path).toEqual(["password"]);
    }
  });

  it("rejects a password longer than 128 characters", () => {
    const result = userCreateFormSchema.safeParse({
      ...validCreateValues,
      password: "a".repeat(LOGIN_PASSWORD_MAX_LENGTH + 1),
    });

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0]?.path).toEqual(["password"]);
    }
  });

  it("rejects a name longer than 255 characters", () => {
    const result = userCreateFormSchema.safeParse({
      ...validCreateValues,
      name: "a".repeat(256),
    });

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0]?.path).toEqual(["name"]);
    }
  });

  it("rejects an invalid role", () => {
    const result = userCreateFormSchema.safeParse({
      ...validCreateValues,
      role: "superadmin",
    });

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0]?.path).toEqual(["role"]);
    }
  });
});

describe("toUserCreatePayload", () => {
  it("maps form values to the API payload", () => {
    expect(
      toUserCreatePayload({
        email: "new@example.com",
        password: "password123",
        name: "New",
        role: "admin",
        is_active: false,
      }),
    ).toEqual({
      email: "new@example.com",
      password: "password123",
      name: "New",
      role: "admin",
      is_active: false,
    });
  });
});

describe("userEditFormSchema", () => {
  it("trims email and name", () => {
    const result = userEditFormSchema.safeParse({
      email: "  user@example.com  ",
      name: "  Name  ",
      role: "admin",
      is_active: false,
    });

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.email).toBe("user@example.com");
      expect(result.data.name).toBe("Name");
    }
  });

  it("rejects invalid email", () => {
    const result = userEditFormSchema.safeParse({
      email: "not-an-email",
      name: "Name",
      role: "user",
      is_active: true,
    });

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0]?.path).toEqual(["email"]);
    }
  });
});

describe("userChangePasswordFormSchema", () => {
  it("accepts a valid password", () => {
    const result = userChangePasswordFormSchema.safeParse({
      password: "password123",
    });

    expect(result.success).toBe(true);
  });

  it("rejects an empty password", () => {
    const result = userChangePasswordFormSchema.safeParse({
      password: "",
    });

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0]?.path).toEqual(["password"]);
    }
  });

  it("rejects a short password", () => {
    const result = userChangePasswordFormSchema.safeParse({
      password: "a".repeat(USER_PASSWORD_MIN_LENGTH - 1),
    });

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0]?.path).toEqual(["password"]);
    }
  });

  it("rejects a password longer than 128 characters", () => {
    const result = userChangePasswordFormSchema.safeParse({
      password: "a".repeat(LOGIN_PASSWORD_MAX_LENGTH + 1),
    });

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0]?.path).toEqual(["password"]);
    }
  });
});
