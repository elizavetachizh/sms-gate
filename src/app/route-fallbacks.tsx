import type { ErrorComponentProps } from "@tanstack/react-router";
import { Link } from "@tanstack/react-router";
import { defaultMailingsSearch } from "@/features/mailings/search";
import { Button } from "@/shared/ui/button";
import { QueryErrorPanel } from "@/shared/ui/query-error-panel";

function MailingsButton() {
  return (
    <Button asChild>
      <Link to="/mailings" search={defaultMailingsSearch}>
        К рассылкам
      </Link>
    </Button>
  );
}

export function RouteNotFound() {
  return (
    <div className="mx-auto w-full max-w-screen-xl space-y-4 px-6 py-8">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">
          Страница не найдена
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Такой страницы нет. Проверьте адрес или вернитесь к рассылкам.
        </p>
      </div>
      <MailingsButton />
    </div>
  );
}

export function RouteError({ error, reset }: ErrorComponentProps) {
  return (
    <div className="mx-auto w-full max-w-screen-xl space-y-4 px-6 py-8">
      <QueryErrorPanel
        title="Не удалось открыть страницу"
        error={error}
        onRetry={reset}
      />
      <MailingsButton />
    </div>
  );
}
