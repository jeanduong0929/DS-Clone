"use client";

import { InferRequestType, InferResponseType } from "hono";

import { client } from "@/lib/hono";
import { useMutation, useQueryClient } from "@tanstack/react-query";

type RequestType = InferRequestType<
  (typeof client.api.auth)["logout"]["$post"]
>;
type ResponseType = InferResponseType<
  (typeof client.api.auth)["logout"]["$post"]
>;

/**
 * A custom hook that handles user logout functionality.
 *
 * This hook uses the `useMutation` hook from React Query to perform
 * the logout operation. It sends a request to the logout endpoint
 * and manages the mutation state, including success and error handling.
 *
 * @returns {Object} An object containing the mutation state and methods.
 * @returns {Function} mutate - A function to trigger the logout mutation.
 * @returns {boolean} isLoading - Indicates if the logout request is in progress.
 * @returns {Error | null} error - Contains error information if the logout request fails.
 *
 * @example
 * const { mutate: logout, isLoading, error } = useLogout();
 * const handleLogout = () => {
 *   logout();
 * };
 *
 * if (isLoading) return <div>Logging out...</div>;
 * if (error) return <div>Error: {error.message}</div>;
 *
 * @throws {Error} Throws an error if the logout request fails.
 *
 * @description This hook is designed to be used in components where
 * user logout functionality is required. It ensures that the application
 * state is updated correctly after a successful logout.
 */
export const useLogout = () => {
  const queryClient = useQueryClient();

  const mutation = useMutation<ResponseType, Error, RequestType>({
    mutationFn: async () => {
      const resp = await client.api.auth["logout"]["$post"]();
      if (!resp.ok) {
        throw new Error("Failed to logout");
      }
      return await resp.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["auth"] });
      window.location.reload();
    },
  });

  return mutation;
};
