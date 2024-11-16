"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export const CurrencyDropdown = () => {
  const [currency, setCurrency] = useState("USD $");

  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="flex items-center text-xs font-light focus:outline-none">
        <span>{currency}</span>
        <ChevronDown className="size-3 ml-1" />
      </DropdownMenuTrigger>
      <DropdownMenuContent
        className="rounded-none text-muted-foreground p-5"
        align="end"
      >
        <DropdownMenuItem
          className="focus:bg-transparent focus:text-muted-foreground/80 text-xs cursor-pointer"
          onClick={() => setCurrency("EUR €")}
        >
          EUR €
        </DropdownMenuItem>
        <DropdownMenuItem
          className="focus:bg-transparent focus:text-muted-foreground/80 text-xs cursor-pointer"
          onClick={() => setCurrency("GBP £")}
        >
          GBP £
        </DropdownMenuItem>
        <DropdownMenuItem
          className="focus:bg-transparent focus:text-muted-foreground/80 text-xs cursor-pointer"
          onClick={() => setCurrency("USD $")}
        >
          USD $
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
