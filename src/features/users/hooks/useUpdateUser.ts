import { useMutation, useQueryClient } from "@tanstack/react-query";
import { usersApi, type UserUpdate } from "@/shared/api";
import { userKeys } from "../api/users.keys";

export function useUpdateUser(userId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: UserUpdate) => usersApi.update(userId, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: userKeys.lists() });
    },
  });
}
