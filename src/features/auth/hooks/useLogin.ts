import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  isUnauthorizedError,
  meApi,
  type BasicCredentials,
} from "@/shared/api";
import {
  clearCredentials,
  setCredentials,
} from "@/features/auth/credentials-storage";
import { authKeys } from "../api/auth.keys";

export function useLogin() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (credentials: BasicCredentials) => {
      try {
        // Inactive users are 401 from GET /users/me/ — same as a bad password.
        const user = await meApi.get(credentials);
        setCredentials(credentials);
        return user;
      } catch (error) {
        if (isUnauthorizedError(error)) {
          clearCredentials();
        }
        throw error;
      }
    },
    onSuccess: (user) => {
      queryClient.setQueryData(authKeys.me, user);
    },
  });
}
