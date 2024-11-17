import React, { useState } from "react";
import { ShoppingBag } from "lucide-react";
import { IconButton } from "./icon-button";

import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTrigger,
} from "@/components/ui/sheet";
import { cn } from "@/lib/utils";

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
              onClick={() => setIsCartOpen(!isCartOpen)}
            >
              Cart
            </li>
            <li
              role="button"
              className={cn(
                isCartOpen ? "text-muted-foreground" : "text-black"
              )}
              onClick={() => setIsCartOpen(!isCartOpen)}
            >
              Recently Viewed
            </li>
          </ul>
        </SheetHeader>

        <hr className="w-full" />
      </SheetContent>
    </Sheet>
  );
};
