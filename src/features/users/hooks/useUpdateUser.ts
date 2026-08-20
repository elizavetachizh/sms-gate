import { useMutation, useQueryClient } from "@tanstack/react-query";
import { usersApi, type UserRead, type UserUpdate } from "@/shared/api";
import { authKeys } from "@/features/auth/api/auth.keys";
import {
  getCredentials,
  setCredentials,
} from "@/features/auth/credentials-storage";
import { userKeys } from "../api/users.keys";

export function useUpdateUser(userId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: UserUpdate) => usersApi.update(userId, payload),
    onSuccess: (updated, payload) => {
      queryClient.invalidateQueries({ queryKey: userKeys.lists() });

      const me = queryClient.getQueryData<UserRead>(authKeys.me);
      if (me?.id !== userId) {
        return;
      }

      queryClient.setQueryData(authKeys.me, updated);

      const stored = getCredentials();
      if (!stored) {
        return;
      }

      if (payload.email === undefined && payload.password === undefined) {
        return;
      }

      setCredentials({
        email: payload.email ?? stored.email,
        password: payload.password ?? stored.password,
      });
    },
  });
}
