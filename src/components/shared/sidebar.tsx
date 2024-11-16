import React, { useState } from "react";
import Link from "next/link";
import { ChevronLeft, ChevronRight, Menu } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";

import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { IconButton } from "./icon-button";

export const Sidebar = () => {
  const [showCategory, setShowCategory] = useState(false);

  const variants = {
    enter: (direction: number) => ({
      x: direction * 100,
      opacity: 0,
    }),
    center: {
      x: 0,
      opacity: 1,
    },
    exit: (direction: number) => ({
      x: direction * -100,
      opacity: 0,
    }),
  };

  const transition = {
    duration: 0.2,
    ease: "easeInOut",
  };

  return (
    <Sheet>
      <SheetTrigger>
        <IconButton>
          <Menu className="size-6 text-black" />
        </IconButton>
      </SheetTrigger>
      <SheetContent side={"left"} className="flex flex-col gap-y-10">
        <SheetHeader>
          <SheetTitle className="text-3xl">JEAN VINCERO</SheetTitle>
        </SheetHeader>

        <div className="flex flex-col gap-y-5 text-muted-foreground text-sm font-thin">
          <AnimatePresence
            mode="wait"
            initial={false}
            custom={showCategory ? 1 : -1}
          >
            {!showCategory ? (
              <motion.div
                key="main"
                custom={-1}
                variants={variants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={transition}
              >
                <SidebarItem setShowCategory={setShowCategory} />
              </motion.div>
            ) : (
              <motion.div
                key="category"
                custom={1}
                variants={variants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={transition}
              >
                <CategoryMenu setShowCategory={setShowCategory} />
              </motion.div>
            )}
          </AnimatePresence>

          <hr className="w-full" />

          <Link
            href={"/account/login"}
            className="hover:text-muted-foreground/80"
          >
            Register / Login
          </Link>
        </div>
      </SheetContent>
    </Sheet>
  );
};

/**
 * SidebarItem component renders a list of navigation links and a button
 * to show product categories. It allows users to navigate to different
 * sections of the application.
 *
 * @param {Object} props - The component props.
 * @param {(show: boolean) => void} props.setShowCategory - A function to
 * set the visibility of the category menu.
 *
 * @returns {JSX.Element} The rendered SidebarItem component.
 */
const SidebarItem = ({
  setShowCategory,
}: {
  setShowCategory: (show: boolean) => void;
}) => {
  return (
    <div className="flex flex-col gap-y-5">
      <Link href={"/"} className="hover:text-muted-foreground/80">
        Home
      </Link>

      <Link href={"/products"} className="hover:text-muted-foreground/80">
        All Products
      </Link>

      <button
        className="text-muted-foreground/80 font-thin flex justify-between items-center"
        onClick={() => setShowCategory(true)}
      >
        <span>Shop by Category</span>
        <ChevronRight className="size-4" />
      </button>

      <Link href={"/contact"} className="hover:text-muted-foreground/80">
        Contact Us
      </Link>
    </div>
  );
};

/**
 * CategoryMenu component renders a list of product categories
 * and a button to close the category menu. It allows users to
 * navigate to specific product categories within the application.
 *
 * @param {Object} props - The component props.
 * @param {(show: boolean) => void} props.setShowCategory - A function to
 * set the visibility of the category menu.
 *
 * @returns {JSX.Element} The rendered CategoryMenu component.
 */
const CategoryMenu = ({
  setShowCategory,
}: {
  setShowCategory: (show: boolean) => void;
}) => {
  return (
    <div className="flex flex-col gap-y-5">
      <button
        onClick={() => setShowCategory(false)}
        className="hover:text-muted-foreground/80 flex justify-between items-center"
      >
        <span>Shop by Category</span>
        <ChevronLeft className="size-4" />
      </button>

      <hr className="w-full" />

      <Link
        href={"/products/hoodies"}
        className="hover:text-muted-foreground/80"
      >
        Hoodies
      </Link>

      <Link
        href={"/products/shirts"}
        className="hover:text-muted-foreground/80"
      >
        Shirts
      </Link>

      <Link
        href={"/products/trousers"}
        className="hover:text-muted-foreground/80"
      >
        Trousers
      </Link>
    </div>
  );
};
