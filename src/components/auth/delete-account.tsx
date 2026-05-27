"use client";
import { Button } from "@/src/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/src/components/ui/dialog";
import { auth } from "@/src/lib/firebase";
import {
  deleteUser,
  GoogleAuthProvider,
  reauthenticateWithPopup,
  signOut,
  User,
} from "firebase/auth";
import { Trash } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { Spinner } from "../ui/spinner";
import { Input } from "../ui/input";

async function deleteFirebaseUser(user: User) {
  try {
    await deleteUser(user);
  } catch (error: unknown) {
    if (getErrorCode(error) !== "auth/requires-recent-login") throw error;

    await reauthenticateWithPopup(user, new GoogleAuthProvider());

    if (auth.currentUser?.uid !== user.uid) {
      await signOut(auth);
      throw new Error("Account diverso rilevato, operazione annullata");
    }

    await deleteUser(user);
  }
}

export default function DeleteAccount({
  username,
}: Readonly<{ username: string }>) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [confirmText, setConfirmText] = useState("");
  const [open, setOpen] = useState(false);

  const isConfirmed = confirmText === username;

  async function handleDelete() {
    if (!isConfirmed) return;

    const user = auth.currentUser;
    if (!user) {
      router.push("/login");
      return;
    }

    setLoading(true);

    try {
      await cancelSubscriptionIfAny();
      await deleteFirebaseUser(user);
      await callDeleteApi(user);
    } catch (error: unknown) {
      toast.error(
        getErrorCode(error) === "auth/popup-closed-by-user"
          ? "Finestra di autenticazione chiusa"
          : "Errore durante l'eliminazione dell'account",
        { position: "bottom-center" },
      );
    } finally {
      setLoading(false);
    }
  }

  async function cancelSubscriptionIfAny() {
    const res = await fetch("/api/paddle/subscription/cancel", {
      method: "POST",
    });

    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      throw new Error(
        data?.error ?? "Errore durante la cancellazione dell'abbonamento",
      );
    }
  }

  async function callDeleteApi(user: User) {
    let freshIdToken: string | null = null;
    try {
      freshIdToken = await user.getIdToken(true);
    } catch {}

    const res = await fetch("/api/auth/delete", {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        ...(freshIdToken ? { "X-Firebase-ID-Token": freshIdToken } : {}),
      },
      body: JSON.stringify({ confirmUsername: confirmText }),
    });

    if (res.ok) {
      await signOut(auth);
      router.push("/login");
      return;
    }

    const data = await res.json().catch(() => ({}));
    toast.error(data?.error ?? "Errore durante l'eliminazione", {
      position: "bottom-center",
    });
  }

  function handleOpenChange(isOpen: boolean) {
    setOpen(isOpen);
    if (!isOpen) setConfirmText("");
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button variant="destructive">
          <Trash />
          Elimina l&apos;account e tutti i tuoi dati
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Eliminazione Account</DialogTitle>
        </DialogHeader>
        <DialogDescription>
          Sei sicuro di voler eliminare il tuo account? Tutti i tuoi formulari
          verranno eliminati con esso. Questa azione non è reversibile.
        </DialogDescription>

        <div className="flex flex-col gap-2">
          <p className="text-sm text-muted-foreground">
            Per confermare, scrivi il tuo nome utente{" "}
            <span className="">&quot;{username}&quot;</span> qui sotto:
          </p>
          <Input
            value={confirmText}
            onChange={(e) => setConfirmText(e.target.value)}
            autoComplete="off"
            disabled={loading}
          />
        </div>

        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline" disabled={loading}>
              Chiudi
            </Button>
          </DialogClose>
          <Button
            variant="destructive"
            onClick={handleDelete}
            disabled={!isConfirmed || loading}
          >
            {loading ? <Spinner data-icon="inline-start" /> : "Elimina"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function getErrorCode(error: unknown) {
  return typeof error === "object" &&
    error !== null &&
    "code" in error &&
    typeof error.code === "string"
    ? error.code
    : null;
}
