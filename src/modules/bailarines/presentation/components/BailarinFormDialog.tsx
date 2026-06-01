"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/shared/components/ui/dialog";
import type { Bailarin } from "../../domain";
import { BailarinForm } from "./BailarinForm";

interface BailarinFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
  bailarin?: Bailarin;
}

export function BailarinFormDialog({
  open,
  onOpenChange,
  onSuccess,
  bailarin,
}: BailarinFormDialogProps) {
  const isEditing = !!bailarin;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? "Editar bailarín" : "Nuevo bailarín"}
          </DialogTitle>
          <DialogDescription>
            {isEditing
              ? "Modifica los datos del bailarín"
              : "Completa los datos para registrar un nuevo bailarín"}
          </DialogDescription>
        </DialogHeader>
        <BailarinForm bailarin={bailarin} onSuccess={onSuccess} />
      </DialogContent>
    </Dialog>
  );
}
