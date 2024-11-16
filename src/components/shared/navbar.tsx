"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { Menu, Search, ShoppingCart } from "lucide-react";
import { Sidebar } from "./sidebar";

import { cn } from "@/lib/utils";

export const Navbar = () => {
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 40);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div
      className={cn(
        "h-[65px] w-full flex items-center sticky top-0 z-50 bg-white transition-all duration-100 ease-in-out",
        isScrolled ? "border-b" : "border-none"
      )}
    >
      <div className="max-w-screen-2xl mx-auto w-11/12 flex items-center justify-between">
        <Sidebar />
        <Link href="/" className="font-bold text-2xl">
          JEAN VINCERO
        </Link>
        <div className="flex items-center gap-x-5">
          <Search role="button" className="size-6" />
          <ShoppingCart role="button" className="size-6" />
        </div>
      </div>
    </div>
  );
};
