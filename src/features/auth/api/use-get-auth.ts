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

/**
 * A custom hook that manages user authentication state.
 *
 * This hook uses the `useQuery` hook from React Query to fetch the
 * authentication status of the user. It maintains the authentication
 * state using Jotai's atom and provides a way to access whether the
 * user is signed in or not.
 *
 * @returns {Object} An object containing the query state and the
 *                   authentication status.
 * @returns {boolean} isSignedIn - Indicates if the user is signed in.
 * @returns {boolean} isLoading - Indicates if the query is currently loading.
 * @returns {Error | null} error - Contains error information if the query fails.
 * @returns {ResponseType | undefined} data - The response data from the API.
 *
 * @example
 * const { isSignedIn, isLoading, error } = useAuth();
 * if (isLoading) return <div>Loading...</div>;
 * if (error) return <div>Error: {error.message}</div>;
 * return <div>User is {isSignedIn ? "signed in" : "not signed in"}</div>;
 */
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
