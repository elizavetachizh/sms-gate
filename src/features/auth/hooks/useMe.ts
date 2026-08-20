import { useQuery } from "@tanstack/react-query";
import { getCredentials } from "@/features/auth/credentials-storage";
import { meQueryOptions } from "../api/me-query";

export function useMe() {
  return useQuery({
    ...meQueryOptions,
    enabled: getCredentials() !== null,
  });
}
