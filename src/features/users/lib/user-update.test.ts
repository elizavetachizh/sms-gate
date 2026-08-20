import { describe, expect, it } from "vitest";
import { userFixture } from "@/test/fixtures";
import { buildUserUpdatePayload, toUserEditFormValues } from "./user-update";

describe("toUserEditFormValues", () => {
  it("leaves password empty", () => {
    expect(toUserEditFormValues(userFixture)).toEqual({
      email: userFixture.email,
      password: "",
      name: userFixture.name,
      role: userFixture.role,
      is_active: userFixture.is_active,
    });
  });
});

describe("buildUserUpdatePayload", () => {
  it("returns null when nothing changed", () => {
    expect(
      buildUserUpdatePayload(toUserEditFormValues(userFixture), userFixture),
    ).toBeNull();
  });

  it("includes only changed fields", () => {
    expect(
      buildUserUpdatePayload(
        {
          email: "other@example.com",
          password: "password123",
          name: "Other",
          role: "admin",
          is_active: false,
        },
        userFixture,
      ),
    ).toEqual({
      email: "other@example.com",
      password: "password123",
      name: "Other",
      role: "admin",
      is_active: false,
    });
  });

  it("omits an empty password", () => {
    expect(
      buildUserUpdatePayload(
        {
          ...toUserEditFormValues(userFixture),
          name: "Updated",
        },
        userFixture,
      ),
    ).toEqual({ name: "Updated" });
  });
});
