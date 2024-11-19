import { InferResponseType, InferRequestType } from "hono";

import { client } from "@/lib/hono";
import {
  useMutation,
  UseMutationResult,
  useQueryClient,
} from "@tanstack/react-query";

type RequestType = InferRequestType<
  (typeof client.api.auth.login)["$post"]
>["json"];
type ResponseType = InferResponseType<(typeof client.api.auth.login)["$post"]>;

/**
 * Custom hook for handling user login.
 *
 * This hook utilizes the `useMutation` hook from React Query to manage
 * the login process. It sends a login request to the server and handles
 * the response, including error handling for invalid credentials.
 *
 * @returns {UseMutationResult<ResponseType, Error, RequestType>} - The mutation object
 * containing the status, error, and methods to trigger the login mutation.
 */
export const useLogin = (): UseMutationResult<
  ResponseType,
  Error,
  RequestType
> => {
  const queryClient = useQueryClient();

  const mutation = useMutation<ResponseType, Error, RequestType>({
    mutationFn: async (json) => {
      const response = await client.api.auth.login["$post"]({ json });

      const data = await response.json();

      if (!response.ok) {
        if (response.status === 400) {
          if ("error" in data) {
            throw new Error(data.error);
          }
        }
      }

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["auth"] });
    },
  });

  return mutation;
};
