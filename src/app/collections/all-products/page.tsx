"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";

import { useGetProducts } from "@/features/products/api/use-get-products";
import { Loader2 } from "lucide-react";

const AllProductsPage = () => {
  const { data, isLoading } = useGetProducts();

  if (isLoading)
    return (
      <div className="min-h-[calc(100vh-105px)] flex justify-center items-center">
        <Loader2 className="animate-spin size-10" />
      </div>
    );

  return (
    <div className="py-10">
      <div className="grid grid-cols-4 gap-x-5 gap-y-5">
        {data?.map((p) => (
          <Link
            key={p.id}
            href={`/collections/all-products/products/${p.id}`}
            className="relative group flex flex-col gap-y-5"
          >
            <Image
              src={p.productImages[0].url}
              alt={p.name}
              width={500}
              height={500}
              className="opacity-100 group-hover:opacity-0 transition-opacity duration-300 ease-in-out"
            />
            <Image
              src={p.productImages[1].url}
              alt={p.name}
              width={500}
              height={500}
              className="absolute top-0 left-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 ease-in-out"
            />
            <div className="flex flex-col gap-y-1">
              <span className="font-thin text-sm">{p.name}</span>
              <span className="font-thin text-sm">${p.price}</span>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default AllProductsPage;
