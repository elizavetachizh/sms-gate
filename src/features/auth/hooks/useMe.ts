import { useQuery } from "@tanstack/react-query";
import { meApi } from "@/shared/api";

export function useMe() {
  return useQuery({
    queryKey: ["me"],
    queryFn: () => meApi.get(),
  });
}
