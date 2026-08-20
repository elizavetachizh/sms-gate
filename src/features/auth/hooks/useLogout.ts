import { useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";
import { defaultLoginSearch } from "../search";
import { clearAuthSession } from "../session";

export function useLogout() {
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  return () => {
    clearAuthSession(queryClient);
    void navigate({ to: "/login", search: defaultLoginSearch, replace: true });
  };
}
