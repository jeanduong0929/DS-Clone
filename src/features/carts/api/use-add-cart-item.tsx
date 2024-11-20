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
