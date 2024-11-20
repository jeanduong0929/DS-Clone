"use client";

import { useEffect } from "react";

interface UseRecentlyViewedItemsProps {
  productId: string;
}

export const useRecentlyViewedItems = ({
  productId,
}: UseRecentlyViewedItemsProps) => {
  useEffect(() => {
    const data = localStorage.getItem("itemsRecentlyViewed");
    if (data && productId) {
      const parsed = JSON.parse(data);
      if (!parsed.includes(productId)) {
        parsed.push(productId);
        localStorage.setItem("itemsRecentlyViewed", JSON.stringify(parsed));
      }
    } else {
      localStorage.setItem("itemsRecentlyViewed", JSON.stringify([productId]));
    }
  }, [productId]);
};
