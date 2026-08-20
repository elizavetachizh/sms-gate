import type { UserRead, UserUpdate } from "@/shared/api";
import type { UserEditFormValues } from "../schemas/user.schema";

export function toUserEditFormValues(user: UserRead): UserEditFormValues {
  return {
    email: user.email,
    password: "",
    name: user.name,
    role: user.role,
    is_active: user.is_active,
  };
}

export function buildUserUpdatePayload(
  values: UserEditFormValues,
  original: UserRead,
): UserUpdate | null {
  const payload: UserUpdate = {};

  if (values.email !== original.email) {
    payload.email = values.email;
  }

  if (values.password !== "") {
    payload.password = values.password;
  }

  if (values.name !== original.name) {
    payload.name = values.name;
  }

  if (values.role !== original.role) {
    payload.role = values.role;
  }

  if (values.is_active !== original.is_active) {
    payload.is_active = values.is_active;
  }

  return Object.keys(payload).length > 0 ? payload : null;
}
