import { useQuery } from "@tanstack/react-query";

import { client } from "@/lib/hono";

export const useGetAuth = () => {
  const query = useQuery({
    queryKey: ["users"],
    queryFn: async () => {
      const resp = await client.api.users.$get();

      if (!resp.ok) {
        throw new Error("Failed to fetch users");
      }
    },
  });

  return query;
};
