"use client";

import React, { useState } from "react";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

type DialogProps = {
  title: string;
  description: string;
  confirmLabel?: string;
  cancelLabel?: string;
};

export const useConfirm = (): [
  () => Promise<boolean>,
  (props: DialogProps) => JSX.Element
] => {
  const [state, setState] = useState<{
    resolve: (value: boolean) => void;
  } | null>(null);

  const confirm = () =>
    new Promise<boolean>((resolve, _reject) => setState({ resolve }));

  const handleConfirm = () => {
    state?.resolve(true);
    setState(null);
  };

  const handleCancel = () => {
    state?.resolve(false);
    setState(null);
  };

  const ConfirmDialog = ({
    title,
    description,
    confirmLabel = "Confirm",
    cancelLabel = "Cancel",
  }: DialogProps) => (
    <Dialog open={!!state}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>
        <DialogFooter className="flex items-center gap-x-3">
          <Button variant={"secondary"} onClick={handleCancel}>
            {cancelLabel}
          </Button>
          <Button onClick={handleConfirm}>{confirmLabel}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );

  return [confirm, ConfirmDialog] as const;
};
