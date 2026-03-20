"use client"
import { Button } from "@/src/components/ui/button";
import { Trash } from "lucide-react";
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/src/components/ui/dialog";
import { toast } from "sonner";
import { deleteUser, GoogleAuthProvider, reauthenticateWithPopup, signOut } from "firebase/auth";
import { auth } from "@/src/lib/firebase";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Spinner } from "../ui/spinner";

export default function deleteAccount() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);

    async function handleDelete() {
        const user = auth.currentUser;
        if (!user) {
            router.push("/login")
            return;
        }

        setLoading(true);

        try {
            await deleteUser(user);
        } catch (error: any) {
            if (error.code === "auth/requires-recent-login") {
                try {
                    await reauthenticateWithPopup(user, new GoogleAuthProvider());
                    await deleteUser(user);
                } catch (e) {
                    console.error("Errore ri-autenticazione:", e);
                    toast.error("Errore durante la ri-autenticazione", { position: "bottom-center" });
                    return;
                }
            } else {
                toast.error("Errore durante l'eliminazione dell'account", { position: "bottom-center" });
                return;
            }
        } finally {
            setLoading(false);
        }

        await signOut(auth);
        await fetch("/api/auth/delete-account");
        router.push("/login");
    }

    return (
        <Dialog>
            <DialogTrigger asChild>
                <Button variant="destructive">
                    <Trash />
                    {loading ? (
                        <Spinner data-icon="inline-start" />
                    ) : (
                        "Elimina l'account e tutti i tuoi dati"
                    )}
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