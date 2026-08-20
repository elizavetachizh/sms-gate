import { describe, expect, it } from "vitest";
import { userFixture } from "@/test/fixtures";
import { buildUserUpdatePayload, toUserEditFormValues } from "./user-update";

describe("toUserEditFormValues", () => {
  it("maps account fields without a password", () => {
    expect(toUserEditFormValues(userFixture)).toEqual({
      email: userFixture.email,
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
          name: "Other",
          role: "admin",
          is_active: false,
        },
        userFixture,
      ),
    ).toEqual({
      email: "other@example.com",
      name: "Other",
      role: "admin",
      is_active: false,
    });
  });
});
