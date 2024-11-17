import { InferRequestType, InferResponseType } from "hono";
import { atom, useAtom } from "jotai";

import { useQuery } from "@tanstack/react-query";
import { client } from "@/lib/hono";

type RequestType = InferRequestType<(typeof client.api.auth.protected)["$get"]>;
type ResponseType = InferResponseType<
  (typeof client.api.auth.protected)["$get"]
>;

const authAtom = atom<{
  isSignedIn: boolean;
} | null>(null);

export const useAuth = () => {
  const [auth, setAuth] = useAtom(authAtom);

  const query = useQuery<ResponseType, Error, RequestType>({
    queryKey: ["auth"],
    queryFn: async () => {
      const resp = await client.api.auth.protected["$get"]();
      const data = await resp.json();

      if (!resp.ok) {
        throw new Error("Failed to fetch users");
      }

      setAuth({ isSignedIn: true });
      return data;
    },
    staleTime: 5 * 60 * 1000, // after 5 minutes refetch data from server
    retry: false,
    refetchOnWindowFocus: false,
  });

  return {
    ...query,
    isSignedIn: auth?.isSignedIn ?? false,
  };
};
