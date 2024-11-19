"use client";

import { InferResponseType } from "hono";

import { client } from "@/lib/hono";
import { useQuery } from "@tanstack/react-query";

type ResponseType = InferResponseType<
  (typeof client.api.products)[":productId"]["$get"]
>["data"];

interface UseGetProductIdProps {
  productId: string;
}

/**
 * A custom hook that fetches a product by its ID.
 *
 * This hook uses the `useQuery` hook from React Query to manage the
 * fetching and caching of product data based on the provided product ID.
 * It sends a GET request to the API endpoint to retrieve the product
 * details and handles any errors that may occur during the fetch process.
 *
 * @param {UseGetProductIdProps} props - The properties for the hook.
 * @param {string} props.productId - The ID of the product to fetch.
 *
 * @returns {Object} The query object containing the product data,
 * loading state, and error information.
 *
 * @example
 * const { data, error, isLoading } = useGetProductId({ productId: "123" });
 * if (isLoading) return <div>Loading...</div>;
 * if (error) return <div>Error: {error.message}</div>;
 * return <ProductDetail product={data} />;
 */
export const useGetProductId = ({ productId }: UseGetProductIdProps) => {
  const query = useQuery<ResponseType, Error>({
    queryKey: ["products", productId],
    queryFn: async () => {
      const resp = await client.api.products[":productId"].$get({
        param: {
          productId,
        },
      });

      if (!resp.ok) {
        throw new Error("Failed to fetch product");
      }

      const { data } = await resp.json();
      return data;
    },
  });

  return query;
};
