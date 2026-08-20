import { z } from "zod";

export const LOGIN_PASSWORD_MAX_LENGTH = 128;

export const loginFormSchema = z.object({
  email: z.string().trim().email("Введите корректный email"),
  password: z
    .string()
    .min(1, "Введите пароль")
    .max(LOGIN_PASSWORD_MAX_LENGTH, "Не более 128 символов"),
});

export type LoginFormValues = z.infer<typeof loginFormSchema>;

export const defaultLoginFormValues: LoginFormValues = {
  email: "",
  password: "",
};
