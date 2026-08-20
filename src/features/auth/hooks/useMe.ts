import { useQuery } from "@tanstack/react-query";
import { meApi } from "@/shared/api";
import { hasCredentials } from "@/features/auth/credentials-storage";
import { authKeys } from "../api/auth.keys";

export function useMe() {
  return useQuery({
    queryKey: authKeys.me,
    queryFn: () => meApi.get(),
    enabled: hasCredentials(),
  });
}
