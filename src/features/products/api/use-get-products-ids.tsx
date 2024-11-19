"use client";

import { useEffect, useState } from "react";
import { InferResponseType } from "hono";

import { client } from "@/lib/hono";
import { useQuery } from "@tanstack/react-query";

type ResponseType = InferResponseType<
  (typeof client.api.products)["ids"]["$get"]
>["data"];

export const useGetProductsByIds = () => {
  const [recentlyViewedIds, setRecentlyViewedIds] = useState<string[]>([]);

  useEffect(() => {
    const data = localStorage.getItem("itemsRecentlyViewed");
    if (data) {
      const parsed = JSON.parse(data);
      setRecentlyViewedIds(parsed);
    }
  }, []);

  const query = useQuery<ResponseType, Error>({
    queryKey: ["products", recentlyViewedIds],
    queryFn: async () => {
      const resp = await client.api.products["ids"]["$get"]({
        query: {
          ids: recentlyViewedIds.join(","),
        },
      });

      if (!resp.ok) {
        throw new Error("Failed to fetch products");
      }

      const { data } = await resp.json();
      return data;
    },
    enabled: recentlyViewedIds.length > 0,
  });

  return {
    ...query,
    size: recentlyViewedIds.length,
  };
};
