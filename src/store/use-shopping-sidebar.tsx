"use client";

import { atom, useAtom } from "jotai";

const openAtom = atom(false);

export const useShoppingSidebar = () => {
  const [open, setOpen] = useAtom(openAtom);
  return [open, setOpen] as const;
};
