"use client";

import { toast } from "sonner";
import { InferRequestType, InferResponseType } from "hono";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { client } from "@/lib/hono";

type RequestType = InferRequestType<
  (typeof client.api.cartItems)[":productId"]["$delete"]
>["param"];
type ResponseType = InferResponseType<
  (typeof client.api.cartItems)[":productId"]["$delete"]
>;

/**
 * Custom hook to delete a cart item from the user's cart.
 *
 * This hook uses the `useMutation` hook from React Query to handle the deletion of a cart item.
 * It sends a DELETE request to the API with the specified product ID. Upon success, it invalidates
 * the cart items query to refresh the data and shows a success toast notification. If an error occurs,
 * it shows an error toast notification.
 *
 * @returns {MutationResult<ResponseType, Error, RequestType>} The mutation object containing
 * the mutation state and methods to trigger the mutation.
 *
 * @example
 * const { mutate: deleteCartItem } = useDeleteCartItem();
 *
 * const handleDelete = (productId) => {
 *   deleteCartItem({ productId });
 * };
 */
export const useDeleteCartItem = () => {
  const queryClient = useQueryClient();

  const mutation = useMutation<ResponseType, Error, RequestType>({
    mutationFn: async ({ productId }: RequestType) => {
      const resp = await client.api.cartItems[":productId"]["$delete"]({
        param: {
          productId,
        },
      });

      const data = await resp.json();

      if (resp.status === 404) {
        if ("error" in data) {
          throw new Error(data.error);
        }
      }
      if (!resp.ok) {
        throw new Error("Failed to remove product from cart");
      }

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["cart-items"] });
      toast.success("Product removed from cart");
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  return mutation;
};
