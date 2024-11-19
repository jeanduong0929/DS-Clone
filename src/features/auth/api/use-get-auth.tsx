import { InferRequestType, InferResponseType } from "hono";

import { useQuery } from "@tanstack/react-query";
import { client } from "@/lib/hono";
import { useUser } from "@/store/use-User";

type RequestType = InferRequestType<(typeof client.api.auth)["$get"]>;
type ResponseType = InferResponseType<(typeof client.api.auth)["$get"]>;

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
 *
 * @throws {Error} Throws an error if the fetch request fails.
 *
 * @description This hook is designed to be used in components where
 * user authentication status is required. It ensures that the application
 * state is updated correctly based on the user's authentication status.
 */
export const useAuth = () => {
  const [auth, setAuth] = useUser();

  const query = useQuery<ResponseType, Error, RequestType>({
    queryKey: ["auth"],
    queryFn: async () => {
      const resp = await client.api.auth["$get"]();
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
