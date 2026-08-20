import { useMutation, useQueryClient } from "@tanstack/react-query";
import { usersApi, type UserCreate } from "@/shared/api";
import { userKeys } from "../api/users.keys";

export function useCreateUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: UserCreate) => usersApi.create(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: userKeys.lists() });
    },
  });
}
