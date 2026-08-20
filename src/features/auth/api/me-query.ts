import { meApi } from "@/shared/api";
import { authKeys } from "./auth.keys";

export const meQueryOptions = {
  queryKey: authKeys.me,
  queryFn: () => meApi.get(),
};
