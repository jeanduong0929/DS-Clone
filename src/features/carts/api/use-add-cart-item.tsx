"use client";

import { toast } from "sonner";
import { InferResponseType, InferRequestType } from "hono";

import { client } from "@/lib/hono";
import { useMutation, useQueryClient } from "@tanstack/react-query";

type RequestType = InferRequestType<
  (typeof client.api.cartItems)["add"]["$post"]
>["query"];

type ResponseType = InferResponseType<
  (typeof client.api.cartItems)["add"]["$post"]
>;

/**
 * Custom hook to add a product to the user's cart.
 *
 * This hook uses the `useMutation` hook from React Query to handle the addition of a cart item.
 * It sends a POST request to the API with the specified product ID. Upon success, it invalidates
 * the cart items query to refresh the data and shows a success toast notification. If an error occurs,
 * it shows an error toast notification.
 *
 * @returns {MutationResult<ResponseType, Error, RequestType>} The mutation object containing
 * the mutation state and methods to trigger the mutation.
 *
 * @example
 * const { mutate: addCartItem } = useAddCartItem();
 *
 * const handleAdd = (productId) => {
 *   addCartItem({ productId });
 * };
 */
export const useAddCartItem = () => {
  const queryClient = useQueryClient();

  const mutation = useMutation<ResponseType, Error, RequestType>({
    mutationFn: async ({ productId }: RequestType) => {
      const resp = await client.api.cartItems["add"]["$post"]({
        query: {
          productId,
        },
      });

      const data = await resp.json();

      if (resp.status === 409) {
        if ("error" in data) {
          throw new Error(data.error);
        }
      }

      if (!resp.ok) {
        throw new Error("Failed to add product to cart");
      }

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["cart-items"] });
      toast.success("Product added to cart");
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  return mutation;
};
