import { z } from "zod";
import {
  LOGIN_PASSWORD_MAX_LENGTH,
  LOGIN_PASSWORD_MIN_LENGTH,
} from "@/features/auth/schemas/login.schema";
import type { UserCreate, UserRole } from "@/shared/api";

export const USER_NAME_MAX_LENGTH = 255;

export const userRoleSchema = z.enum(["user", "admin"]);

export const userCreateFormSchema = z.object({
  email: z.string().trim().email("Введите корректный email"),
  password: z
    .string()
    .min(LOGIN_PASSWORD_MIN_LENGTH, "Не менее 8 символов")
    .max(LOGIN_PASSWORD_MAX_LENGTH, "Не более 128 символов"),
  name: z
    .string()
    .trim()
    .max(USER_NAME_MAX_LENGTH, "Не более 255 символов"),
  role: userRoleSchema,
  is_active: z.boolean(),
});

export type UserCreateFormValues = z.infer<typeof userCreateFormSchema>;

export const defaultUserCreateFormValues: UserCreateFormValues = {
  email: "",
  password: "",
  name: "",
  role: "user",
  is_active: true,
};

export const userEditFormSchema = z.object({
  email: z.string().trim().email("Введите корректный email"),
  password: z
    .string()
    .max(LOGIN_PASSWORD_MAX_LENGTH, "Не более 128 символов")
    .refine(
      (value) =>
        value === "" || value.length >= LOGIN_PASSWORD_MIN_LENGTH,
      "Не менее 8 символов",
    ),
  name: z
    .string()
    .trim()
    .max(USER_NAME_MAX_LENGTH, "Не более 255 символов"),
  role: userRoleSchema,
  is_active: z.boolean(),
});

export type UserEditFormValues = z.infer<typeof userEditFormSchema>;

export const USER_ROLE_LABELS: Record<UserRole, string> = {
  user: "Пользователь",
  admin: "Администратор",
};

export function toUserCreatePayload(
  values: UserCreateFormValues,
): UserCreate {
  return {
    email: values.email,
    password: values.password,
    name: values.name,
    role: values.role,
    is_active: values.is_active,
  };
}
