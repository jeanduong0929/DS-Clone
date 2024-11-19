import React, { useState } from "react";
import { ShoppingBag } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

import { IconButton } from "./icon-button";
import { Skeleton } from "../ui/skeleton";

import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTrigger,
} from "@/components/ui/sheet";
import { cn } from "@/lib/utils";
import { useGetProductsByIds } from "@/features/products/api/use-get-products-ids";

/**
 * ShoppingSidebar component that displays a sidebar for shopping cart and recently viewed products.
 *
 * It contains a trigger button to open the sidebar, and two sections: Cart and Recently Viewed.
 * The user can toggle between these two sections.
 *
 * @component
 * @returns {JSX.Element} The ShoppingSidebar component.
 */
export const ShoppingSidebar = (): JSX.Element => {
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

/**
 * Cart component that displays the shopping cart.
 *
 * @component
 * @returns {JSX.Element} The Cart component.
 */
const Cart = (): JSX.Element => {
  return <div>Cart</div>;
};

/**
 * RecentlyViewed component that displays a list of recently viewed products.
 *
 * It fetches product data using the `useGetProductsByIds` hook and displays a loading skeleton
 * while the data is being fetched. Once the data is available, it renders the product details.
 *
 * @component
 * @returns {JSX.Element} The RecentlyViewed component.
 */
const RecentlyViewed = (): JSX.Element => {
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
