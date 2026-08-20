import { z } from "zod";
import { LOGIN_PASSWORD_MAX_LENGTH } from "@/features/auth/schemas/login.schema";
import type { UserCreate, UserRole } from "@/shared/api";

export const USER_PASSWORD_MIN_LENGTH = 8;
export const USER_NAME_MAX_LENGTH = 255;

export const userRoleSchema = z.enum(["user", "admin"]);

export const userPasswordSchema = z
  .string()
  .min(USER_PASSWORD_MIN_LENGTH, "Не менее 8 символов")
  .max(LOGIN_PASSWORD_MAX_LENGTH, "Не более 128 символов");

export const userCreateFormSchema = z.object({
  email: z.string().trim().email("Введите корректный email"),
  password: userPasswordSchema,
  name: z.string().trim().max(USER_NAME_MAX_LENGTH, "Не более 255 символов"),
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
  name: z.string().trim().max(USER_NAME_MAX_LENGTH, "Не более 255 символов"),
  role: userRoleSchema,
  is_active: z.boolean(),
});

export type UserEditFormValues = z.infer<typeof userEditFormSchema>;

export const userChangePasswordFormSchema = z.object({
  password: userPasswordSchema,
});

export type UserChangePasswordFormValues = z.infer<
  typeof userChangePasswordFormSchema
>;

export const USER_ROLE_LABELS: Record<UserRole, string> = {
  user: "Пользователь",
  admin: "Администратор",
};

export function toUserCreatePayload(values: UserCreateFormValues): UserCreate {
  return {
    email: values.email,
    password: values.password,
    name: values.name,
    role: values.role,
    is_active: values.is_active,
  };
}
