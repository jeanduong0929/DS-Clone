import React, { useEffect, useState } from "react";
import { Loader2, ShoppingBag } from "lucide-react";
import { IconButton } from "./icon-button";

import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTrigger,
} from "@/components/ui/sheet";
import { cn } from "@/lib/utils";
import { useGetProductsByIds } from "@/features/products/api/use-get-products-ids";
import Image from "next/image";
import { Skeleton } from "../ui/skeleton";
import Link from "next/link";

export const ShoppingSidebar = () => {
  const [isCartOpen, setIsCartOpen] = useState(true);

  return (
    <Sheet>
      <SheetTrigger>
        <IconButton>
          <ShoppingBag role="button" className="size-6" />
        </IconButton>
      </SheetTrigger>
      <SheetContent className="flex flex-col gap-y-5">
        <SheetHeader>
          <ul className="flex items-center gap-x-5 font-thin text-sm">
            <li
              role="button"
              className={cn(
                isCartOpen ? "text-black" : "text-muted-foreground"
              )}
              onClick={() => setIsCartOpen(true)}
            >
              Cart
            </li>
            <li
              role="button"
              className={cn(
                isCartOpen ? "text-muted-foreground" : "text-black"
              )}
              onClick={() => setIsCartOpen(false)}
            >
              Recently Viewed
            </li>
          </ul>
        </SheetHeader>

        <hr className="w-full" />

        {isCartOpen ? <Cart /> : <RecentlyViewed />}
      </SheetContent>
    </Sheet>
  );
};

const Cart = () => {
  return <div>Cart</div>;
};

const RecentlyViewed = () => {
  const { data, isLoading, size } = useGetProductsByIds();

  if (isLoading) {
    return (
      <div className="flex flex-col gap-y-5">
        {Array.from({ length: size }).map((_, index) => (
          <div key={index} className="flex gap-x-5">
            <Skeleton className="w-[150px] h-[187px]" />
            <div className="flex flex-col gap-y-1 text-xs font-thin">
              <Skeleton className="w-[165px] h-[32px]" />
              <Skeleton className="w-[50px] h-[16px]" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div>
      <div className="flex flex-col gap-y-5">
        {data?.map((product) => (
          <Link
            key={product.id}
            href={`/products/${product.id}`}
            className="flex gap-x-5"
          >
            <Image
              src={product.productImages[0].url}
              alt={product.name}
              width={150}
              height={150}
            />
            <div className="flex flex-col gap-y-1 text-xs font-thin">
              <span>{product.name}</span>
              <span>${product.price}</span>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
};
