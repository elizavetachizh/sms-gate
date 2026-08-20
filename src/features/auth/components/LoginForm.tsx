import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { getRouteApi, useNavigate, useRouter } from "@tanstack/react-router";
import { useForm } from "react-hook-form";
import { defaultMailingsSearch } from "@/features/mailings/search";
import { isUnauthorizedError } from "@/shared/api";
import { Button } from "@/shared/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/shared/ui/card";
import { Input } from "@/shared/ui/input";
import { Label } from "@/shared/ui/label";
import { useLogin } from "../hooks/useLogin";
import {
  defaultLoginFormValues,
  loginFormSchema,
  type LoginFormValues,
} from "../schemas/login.schema";
import { toInternalRedirect } from "../session";

const loginRouteApi = getRouteApi("/login");

export function LoginForm() {
  const login = useLogin();
  const navigate = useNavigate();
  const router = useRouter();
  const { redirect: redirectTo } = loginRouteApi.useSearch();
  const [submitError, setSubmitError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginFormSchema),
    defaultValues: defaultLoginFormValues,
  });

  async function onSubmit(values: LoginFormValues) {
    setSubmitError(null);

    try {
      await login.mutateAsync(values);

      const next = toInternalRedirect(redirectTo);
      if (next) {
        router.history.replace(next);
        return;
      }

      await navigate({
        to: "/mailings",
        search: defaultMailingsSearch,
        replace: true,
      });
    } catch (error) {
      if (isUnauthorizedError(error)) {
        setSubmitError("Неверный email или пароль");
        return;
      }

      setSubmitError("Не удалось войти. Попробуйте ещё раз.");
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="w-full max-w-sm">
      <Card>
        <CardHeader>
          <CardTitle>Вход в SMS Gate</CardTitle>
          <CardDescription>Введите email и пароль учётной записи</CardDescription>
        </CardHeader>

        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              autoComplete="username"
              placeholder="user@example.com"
              aria-invalid={Boolean(errors.email)}
              {...register("email")}
            />
            {errors.email?.message && (
              <p className="text-sm text-destructive">{errors.email.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">Пароль</Label>
            <Input
              id="password"
              type="password"
              autoComplete="current-password"
              aria-invalid={Boolean(errors.password)}
              {...register("password")}
            />
            {errors.password?.message && (
              <p className="text-sm text-destructive">{errors.password.message}</p>
            )}
          </div>

          {submitError && (
            <p className="text-sm text-destructive">{submitError}</p>
          )}
        </CardContent>

        <CardFooter>
          <Button type="submit" className="w-full" disabled={login.isPending}>
            {login.isPending ? "Вход…" : "Войти"}
          </Button>
        </CardFooter>
      </Card>
    </form>
  );
}
