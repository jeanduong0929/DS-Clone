"use client";

import React, { useEffect } from "react";
import { Loader2 } from "lucide-react";

import { useGetProductId } from "@/features/products/api/use-get-product-id";
import Image from "next/image";
import { Button } from "@/components/ui/button";

interface ProductPageProps {
  params: {
    productId: string;
  };
}

const ProductPage = ({ params: { productId } }: ProductPageProps) => {
  const { data, isLoading } = useGetProductId({
    productId,
  });

  // TODO: Implement recently viewed products
  // Todo this will be a local storage solution
  // when the user views a product add it to local storage
  // data should be an array of product ids
  // add the product id to the array
  useEffect(() => {
    const data = localStorage.getItem("itemsRecentlyViewed");
    if (data) {
      const parsed = JSON.parse(data);
      // Check if the product id is already in the array
      if (!parsed.includes(productId)) {
        parsed.push(productId);
        localStorage.setItem("itemsRecentlyViewed", JSON.stringify(parsed));
      }
    } else {
      localStorage.setItem("itemsRecentlyViewed", JSON.stringify([productId]));
    }
  }, [productId]);

  if (isLoading)
    return (
      <div className="min-h-[calc(100vh-105px)] flex justify-center items-center">
        <Loader2 className="animate-spin size-10" />
      </div>
    );

  return (
    <div className="py-10 flex gap-x-10">
      <div className="grid grid-cols-2 gap-5">
        {data?.productImages.map((productImage) => (
          <Image
            key={productImage.id}
            src={productImage.url}
            alt={productImage.productId}
            width={500}
            height={500}
          />
        ))}
      </div>

      <div className="flex flex-col gap-y-10">
        <div className="flex flex-col gap-y-3">
          <h1 className="text-3xl">{data?.name}</h1>
          <p className="text-lg font-thin">${data?.price}</p>
        </div>

        <Button className="w-full h-[48px] bg-[#1e3820] font-thin hover:bg-[#152717]">
          ADD TO CART
        </Button>
      </div>
    </div>
  );
};

export default ProductPage;
