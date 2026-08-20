import { Link } from "@tanstack/react-router";
import { useLogout } from "@/features/auth/hooks/useLogout";
import { useMe } from "@/features/auth/hooks/useMe";
import { isAdmin } from "@/features/auth/is-admin";
import { defaultMailingsSearch } from "@/features/mailings/search";
import { defaultProvidersSearch } from "@/features/providers/search";
import { defaultTemplatesSearch } from "@/features/templates/search";
import { defaultUsersSearch } from "@/features/users/search";
import { isUnauthorizedError } from "@/shared/api";
import { cn } from "@/shared/lib/utils";
import { Button } from "@/shared/ui/button";
import { Skeleton } from "@/shared/ui/skeleton";

export function Header() {
  const { data: me, isLoading, isError, error } = useMe();
  const logout = useLogout();
  const showApiError = isError && !isUnauthorizedError(error);

  return (
    <header className="border-b bg-card">
      <div className="mx-auto flex h-14 w-full max-w-screen-xl items-center justify-between px-6">
        <div className="flex items-center gap-6">
          <Link
            to="/mailings"
            search={defaultMailingsSearch}
            className="text-lg font-semibold tracking-tight"
          >
            SMS Gate
          </Link>
          <nav className="flex items-center gap-1">
            <Button variant="ghost" size="sm" asChild>
              <Link
                to="/mailings"
                search={defaultMailingsSearch}
                className={cn("[&.active]:bg-accent")}
                activeProps={{ className: "active" }}
              >
                Рассылки
              </Link>
            </Button>
            <Button variant="ghost" size="sm" asChild>
              <Link
                to="/templates"
                search={defaultTemplatesSearch}
                className={cn("[&.active]:bg-accent")}
                activeProps={{ className: "active" }}
              >
                Шаблоны
              </Link>
            </Button>
            <Button variant="ghost" size="sm" asChild>
              <Link
                to="/providers"
                search={defaultProvidersSearch}
                className={cn("[&.active]:bg-accent")}
                activeProps={{ className: "active" }}
              >
                Провайдеры
              </Link>
            </Button>
            <Button variant="ghost" size="sm" asChild>
              <Link
                to="/stats"
                className={cn("[&.active]:bg-accent")}
                activeProps={{ className: "active" }}
              >
                Статистика
              </Link>
            </Button>
            {isAdmin(me) && (
              <Button variant="ghost" size="sm" asChild>
                <Link
                  to="/users"
                  search={defaultUsersSearch}
                  className={cn("[&.active]:bg-accent")}
                  activeProps={{ className: "active" }}
                >
                  Пользователи
                </Link>
              </Button>
            )}
          </nav>
        </div>

        <div className="flex items-center gap-3">
          {isLoading && <Skeleton className="h-4 w-32" />}
          {showApiError && (
            <span className="text-sm text-muted-foreground">
              API недоступен
            </span>
          )}
          {!isLoading && !isError && me && (
            <span
              className="max-w-48 truncate text-sm text-muted-foreground"
              title={me.email}
            >
              {me.name.trim() || me.email}
            </span>
          )}
          <Button variant="secondary" size="sm" type="button" onClick={logout}>
            Выйти
          </Button>
        </div>
      </div>
    </header>
  );
}
