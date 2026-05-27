"use client";

import { Trash2, X } from "lucide-react";
import { Button } from "../../ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../../ui/dialog";
import { TakeFormulario } from "../take-formulario";
import { Formulario } from "./types";

export function SettingsFooter({
  formulario,
  formularioId,
  onDelete,
}: Readonly<{
  formulario: Formulario;
  formularioId: string;
  onDelete: () => void;
}>) {
  return (
    <div className="flex px-6 py-4 border-t shrink-0 justify-end gap-2">
      <DialogClose asChild>
        <Button variant="outline">
          <X size={16} />
          Chiudi
        </Button>
      </DialogClose>
      {formulario.editable ? (
        formularioId != process.env.NEXT_PUBLIC_FORMULARIO_BENVENUTO_ID && (
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="destructive">
                <Trash2 size={16} />
                Elimina formulario
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>Elimina</DialogTitle>
              </DialogHeader>
              <DialogDescription>
                Sei sicuro di voler eliminare &quot;{formulario.titolo}&quot;?
                Questa azione non è reversibile.
              </DialogDescription>
              <DialogFooter>
                <DialogClose asChild>
                  <Button variant="outline">Chiudi</Button>
                </DialogClose>
                <DialogClose asChild>
                  <Button variant="destructive" onClick={onDelete}>
                    Elimina
                  </Button>
                </DialogClose>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        )
      ) : (
        <TakeFormulario formularioId={formularioId} />
      )}
    </div>
  );
}
