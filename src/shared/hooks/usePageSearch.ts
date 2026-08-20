import { useCallback } from "react";
import { useNavigate } from "@tanstack/react-router";
import type { MailingsSearch } from "@/features/mailings/search";
import type { TemplatesSearch } from "@/features/templates/search";
import type { UsersSearch } from "@/features/users/search";
import { mergePageSearch } from "@/shared/lib/page-search";

type SearchByPath = {
  "/mailings": MailingsSearch;
  "/templates": TemplatesSearch;
  "/users": UsersSearch;
};

export function usePageSearch<TFrom extends keyof SearchByPath>(from: TFrom) {
  const navigate = useNavigate({ from });

  const updateSearch = useCallback(
    (next: Partial<SearchByPath[TFrom]>) => {
      void navigate({
        search: (prev) => mergePageSearch(prev as SearchByPath[TFrom], next),
      } as Parameters<typeof navigate>[0]);
    },
    [navigate],
  );

  return { updateSearch };
}
