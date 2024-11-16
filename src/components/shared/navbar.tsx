"use client";

import React, { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Search, ShoppingCart, X } from "lucide-react";
import { Sidebar } from "./sidebar";
import { Input } from "../ui/input";

import { cn } from "@/lib/utils";

export const Navbar = () => {
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const searchRef = useRef<HTMLInputElement>(null);

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
        {isSearchOpen ? (
          <SearchInput setIsSearchOpen={setIsSearchOpen} />
        ) : (
          <Link href="/" className="font-bold text-2xl">
            JEAN VINCERO
          </Link>
        )}
        <div className="flex items-center gap-x-5">
          <Search
            role="button"
            className="size-6"
            onClick={() => setIsSearchOpen(true)}
          />
          <ShoppingCart role="button" className="size-6" />
        </div>
      </div>
    </div>
  );
};

const SearchInput = ({
  setIsSearchOpen,
}: {
  setIsSearchOpen: (value: boolean) => void;
}) => {
  const searchRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (!searchRef.current?.contains(e.target as Node)) {
        setIsSearchOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [setIsSearchOpen]);

  return (
    <>
      <div className="min-h-screen fixed bg-black/20 w-full top-0 left-0 z-10" />
      <div ref={searchRef} className="flex items-center gap-x-5 w-[719px]">
        <Input
          className="w-full h-[50px] rounded-none bg-white z-20 placeholder:text-xs placeholder:text-muted-foreground placeholder:font-thin focus-visible:ring-black/20"
          placeholder="Search for products, articles, pages"
          autoFocus
        />
        <button
          className="p-2 rounded-full bg-white flex items-center justify-center z-20 lg:opacity-100 opacity-0"
          onClick={() => setIsSearchOpen(false)}
        >
          <X className="size-4" />
        </button>
      </div>
    </>
  );
};
