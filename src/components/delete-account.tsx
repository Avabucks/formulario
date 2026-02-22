"use client"

import { Button } from "@/src/components/ui/button";
import { Trash } from "lucide-react";
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/src/components/ui/dialog";
import { toast } from "sonner";
import { deleteUser, GoogleAuthProvider, reauthenticateWithPopup, signOut } from "firebase/auth";
import { auth } from "@/src/lib/firebase";
import { deleteAccountGDPR } from "@/src/lib/formulari"
import { useRouter } from "next/navigation";

export default function deleteAccount() {
    const router = useRouter()

    async function handleDelete() {
        const user = auth.currentUser;
        if (!user) return;

        try {
            await deleteAccountGDPR();
            await deleteUser(user);
            await fetch("/api/auth/logout", { method: "POST" });
            localStorage.removeItem("email");
            localStorage.removeItem("name");
            localStorage.removeItem("photoURL");
            toast.success("Account eliminato con successo!", { position: "bottom-center" });
            router.push("/");
        } catch (error: any) {
            if (error.code === "auth/requires-recent-login") {
                try {
                    await reauthenticateWithPopup(user, new GoogleAuthProvider());
                    await deleteUser(user);
                    await fetch("/api/auth/logout", { method: "POST" });
                    localStorage.removeItem("email");
                    localStorage.removeItem("name");
                    localStorage.removeItem("photoURL");
                    toast.success("Account eliminato con successo!", { position: "bottom-center" });
                    router.push("/");
                } catch (e) {
                    toast.error("Errore durante la ri-autenticazione", { position: "bottom-center" });
                }
            } else {
                toast.error(error?.message || "Errore durante l'eliminazione dell'account", { position: "bottom-center" });
            }
        }
    }

    return (
        <Dialog>
            <DialogTrigger asChild>
                <Button variant="destructive">
                    <Trash />
                    Elimina l'account e tutti i tuoi dati
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>Eliminazione Account</DialogTitle>
                </DialogHeader>
                <DialogDescription>
                    Sei sicuro di voler eliminare il tuo account? Tutti i tuoi formulari verranno eliminati con esso. Questa azione non è reversibile.
                </DialogDescription>
                <DialogFooter>
                    <DialogClose asChild>
                        <Button variant="outline">Chiudi</Button>
                    </DialogClose>
                    <DialogClose asChild>
                        <Button variant="destructive" onClick={handleDelete}>Elimina</Button>
                    </DialogClose>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}