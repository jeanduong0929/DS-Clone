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
