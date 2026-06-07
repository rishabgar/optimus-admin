import { useQuery } from "@tanstack/react-query";
import { getUserApi } from "../auth/dashboardApi";

export function useGetUser(user_type) {
  return useQuery({
    queryKey: ["users", user_type],
    queryFn: () => getUserApi(user_type),
  });
}
