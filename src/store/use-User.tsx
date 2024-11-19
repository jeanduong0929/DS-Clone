"use client";

import { atom, useAtom } from "jotai";

export const authAtom = atom<{
  isSignedIn: boolean;
} | null>(null);

export const useUser = () => {
  const [auth, setAuth] = useAtom(authAtom);
  return [auth, setAuth] as const;
};
