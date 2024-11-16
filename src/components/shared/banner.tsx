import { Instagram } from "lucide-react";
import { CurrencyDropdown } from "./currency-dropdown-menu";

export const Banner = () => {
  return (
    <div className="h-[40px] w-full bg-[#1e3820] text-white flex items-center">
      <div className="max-w-screen-2xl mx-auto w-11/12 flex items-center justify-between">
        <Instagram role="button" className="size-5" />
        <h1 className="font-extralight text-xs">SHIPPING WORLDWIDE</h1>
        <CurrencyDropdown />
      </div>
    </div>
  );
};
