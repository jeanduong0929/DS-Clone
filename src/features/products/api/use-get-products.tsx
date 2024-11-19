"use client";

import { InferResponseType } from "hono";

import { client } from "@/lib/hono";
import { useQuery } from "@tanstack/react-query";

type ResponseType = InferResponseType<
  (typeof client.api.products)["$get"]
>["data"];

/**
 * A custom hook that fetches a list of products.
 *
 * This hook uses the `useQuery` hook from React Query to manage the
 * fetching and caching of product data. It sends a GET request to the
 * API endpoint to retrieve the products and handles any errors that
 * may occur during the fetch process.
 *
 * @returns {Object} The query object containing the product data,
 * loading state, and error information.
 *
 * @example
 * const { data, error, isLoading } = useGetProducts();
 * if (isLoading) return <div>Loading...</div>;
 * if (error) return <div>Error: {error.message}</div>;
 * return <ProductList products={data} />;
 */
export const useGetProducts = () => {
  const query = useQuery<ResponseType, Error>({
    queryKey: ["products"],
    queryFn: async () => {
      const resp = await client.api.products["$get"]();

      if (!resp.ok) {
        throw new Error("Failed to fetch products");
      }

      const { data } = await resp.json();
      return data;
    },
  });

  return query;
};
