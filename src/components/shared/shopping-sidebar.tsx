import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ShoppingBag, X } from "lucide-react";
import { IconButton } from "./icon-button";
import { Skeleton } from "../ui/skeleton";
import { Button } from "../ui/button";

import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTrigger,
} from "@/components/ui/sheet";
import { cn } from "@/lib/utils";
import { useGetProductsByIds } from "@/features/products/api/use-get-products-ids";
import { useShoppingSidebar } from "@/store/use-shopping-sidebar";
import { useGetCartItems } from "@/features/carts/api/use-get-cart-items";
import { useAuth } from "@/features/auth/api/use-get-auth";
import { useDeleteCartItem } from "@/features/carts/api/use-delete-cart-item";

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
  const [open, setOpen] = useShoppingSidebar();

  return (
    <Sheet open={open} onOpenChange={setOpen}>
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
  const { data, isLoading } = useGetCartItems();
  const { data: user } = useAuth();
  const { mutate: deleteCartItem } = useDeleteCartItem();

  const [, setOpen] = useShoppingSidebar();

  if (isLoading) {
    return (
      <div className="flex flex-col gap-y-5">
        {Array.from({ length: 3 }).map((_, index) => (
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

  if (!user) {
    return (
      <div className="flex flex-col h-screen">
        <Button className="mt-auto" asChild onClick={() => setOpen(false)}>
          <Link href="/account/login">Sign in to view your cart</Link>
        </Button>
      </div>
    );
  }

  return (
    <div>
      <div className="flex flex-col gap-y-5">
        {data?.map((product) => (
          <div
            key={product.id}
            className="flex items-start justify-between gap-x-5"
          >
            <Link href={`/products/${product.id}`} className="flex gap-x-5">
              <Image
                src={product.productImages[0].url}
                alt={product.name}
                width={150}
                height={150}
              />
              <div className="flex flex-col gap-y-1 text-xs font-thin">
                <span>{product.name}</span>
                <span>${product.price}.00</span>
              </div>
            </Link>
            <X
              role="button"
              className="size-5"
              onClick={() =>
                deleteCartItem({
                  productId: product.id,
                })
              }
            />
          </div>
        ))}
      </div>
    </div>
  );
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
