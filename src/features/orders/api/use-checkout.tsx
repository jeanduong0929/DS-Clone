"use client";

import { InferRequestType, InferResponseType } from "hono";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { client } from "@/lib/hono";
import { toast } from "sonner";

type RequestType = InferRequestType<
  (typeof client.api.orders)["$post"]
>["query"];
type ResponseType = InferResponseType<(typeof client.api.orders)["$post"]>;

export const useCheckout = () => {
  const queryClient = useQueryClient();

  const mutation = useMutation<ResponseType, Error, RequestType>({
    mutationFn: async ({ productId }: RequestType) => {
      const resp = await client.api.orders["$post"]({
        query: {
          productId,
        },
      });

      if (!resp.ok) {
        throw new Error("Failed to checkout");
      }

      return await resp.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["cart-items"] });
      toast.success("Order created");
    },
  });

  return mutation;
};
