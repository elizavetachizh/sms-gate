import { useQuery } from "@tanstack/react-query";
import { usersApi, type UserListParams } from "@/shared/api";
import { userKeys } from "../api/users.keys";

export function useUsersList(params: UserListParams) {
  return useQuery({
    queryKey: userKeys.list(params),
    queryFn: () => usersApi.list(params),
  });
}
