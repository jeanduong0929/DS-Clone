import { InferResponseType, InferRequestType } from "hono";
import { toast } from "sonner";

import {
  useMutation,
  UseMutationResult,
  QueryClient,
  useQueryClient,
} from "@tanstack/react-query";
import { client } from "@/lib/hono";

type RequestType = InferRequestType<
  (typeof client.api.auth.register)["$post"]
>["json"];
type ResponseType = InferResponseType<
  (typeof client.api.auth.register)["$post"]
>;

/**
 * Custom hook for user registration.
 *
 * This hook utilizes the `useMutation` hook from React Query to handle
 * the registration process. It sends a POST request to the registration
 * endpoint with the provided email and password. On success, it shows
 * a success toast notification and invalidates the "auth" query to
 * refresh any related data.
 *
 * @returns {UseMutationResult<ResponseType, Error, RequestType>} - Returns
 * the mutation object containing the status and methods to execute the
 * mutation, which can be used in the component for registration.
 */
export const useRegister = (): UseMutationResult<
  ResponseType,
  Error,
  RequestType
> => {
  const queryClient = useQueryClient();

  const mutation = useMutation<ResponseType, Error, RequestType>({
    mutationFn: async (json) => {
      const response = await client.api.auth.register["$post"]({
        json,
      });

      const data = await response.json();

      if (!response.ok) {
        if (response.status === 400) {
          if ("error" in data) {
            throw new Error(data.error);
          }
        } else if (response.status === 409) {
          if ("error" in data) {
            throw new Error(data.error);
          }
        }
      }

      return data;
    },
    onSuccess: () => {
      toast.success("Account created");
      queryClient.invalidateQueries({ queryKey: ["auth"] });
    },
  });

  return mutation;
};
