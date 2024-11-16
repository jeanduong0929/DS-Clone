import React from "react";
import { ChevronRight, Menu } from "lucide-react";

import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import Link from "next/link";

export const Sidebar = () => {
  return (
    <Sheet>
      <SheetTrigger>
        <Menu className="size-6" />
      </SheetTrigger>
      <SheetContent side={"left"} className="flex flex-col gap-y-10">
        <SheetHeader>
          <SheetTitle className="text-3xl">JEAN VINCERO</SheetTitle>
        </SheetHeader>

        <div className="flex flex-col gap-y-5 text-muted-foreground text-sm">
          <Link href={"/"} className="hover:text-muted-foreground/80 font-thin">
            Home
          </Link>
          <Link
            href={"/products"}
            className="hover:text-muted-foreground/80 font-thin"
          >
            All Products
          </Link>
          <button className="text-muted-foreground/80 font-thin flex justify-between items-center">
            <span>Shop by Category</span>
            <ChevronRight className="size-4" />
          </button>
          <Link
            href={"/contact"}
            className="hover:text-muted-foreground/80 font-thin"
          >
            Contact Us
          </Link>

          <hr className="w-full" />

          <Link
            href={"/login"}
            className="hover:text-muted-foreground/80 font-thin"
          >
            Register / Login
          </Link>
        </div>
      </SheetContent>
    </Sheet>
  );
};
