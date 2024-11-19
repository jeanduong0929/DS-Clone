"use client";

import React from "react";
import Image from "next/image";
import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";

import { useGetProductId } from "@/features/products/api/use-get-product-id";
import { Button } from "@/components/ui/button";
import { useRecentlyViewedItems } from "@/features/products/hooks/use-recently-viewed-items";
import { useAuth } from "@/features/auth/api/use-get-auth";

interface ProductPageProps {
  params: {
    productId: string;
  };
}

const ProductPage = ({ params: { productId } }: ProductPageProps) => {
  useRecentlyViewedItems({ productId });

  const { data: user } = useAuth();
  const { data, isLoading } = useGetProductId({
    productId,
  });

  const router = useRouter();

  console.log(user);

  const handleAddToCart = () => {
    if (!user) {
      router.push(`/account/login?redirect=${window.location.pathname}`);
    }
  };

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

        <Button
          className="w-full h-[48px] bg-[#1e3820] font-thin hover:bg-[#152717]"
          onClick={handleAddToCart}
        >
          ADD TO CART
        </Button>
      </div>
    </div>
  );
};

export default ProductPage;
