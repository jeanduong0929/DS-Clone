"use client";

import { InferResponseType } from "hono";

import { client } from "@/lib/hono";
import { useQuery } from "@tanstack/react-query";

type ResponseType = InferResponseType<
  (typeof client.api.cartItems)["$get"]
>["data"];

export const useGetCartItems = () => {
  const query = useQuery<ResponseType, Error>({
    queryKey: ["cart-items"],
    queryFn: async () => {
      const resp = (await client.api.cartItems["$get"]()) as Response;
      const { data } = await resp.json();

      if (resp.status === 401) {
        throw new Error("Unauthorized");
      }
      if (!resp.ok) {
        throw new Error("Failed to fetch cart items");
      }

      return data;
    },
    retry: (_, error) => {
      if (error.message === "Unauthorized") {
        return false;
      }
      return true;
    },
    staleTime: 1000 * 30, // 30 seconds
    gcTime: 1000 * 60 * 5, // 5 minutes
  });

  return query;
};
