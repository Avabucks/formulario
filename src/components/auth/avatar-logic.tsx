"use client"

import { Avatar, AvatarFallback, AvatarImage } from "@/src/components/ui/avatar";
import { Button } from "@/src/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/src/components/ui/dropdown-menu";
import { auth } from "@/src/lib/firebase";
import { signOut } from "firebase/auth";
import { BadgeInfo, Book, Cookie, Handshake, Keyboard, LogOutIcon, Users } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { KbShortcuts } from "../navigation/kb-shortcuts";
import { NewAccountPopup } from "../home/new-account-popup";

export function AvatarLogic() {
    const router = useRouter();
    const [name, setName] = useState<string | null>(null);
    const [photoURL, setPhotoURL] = useState<string | null>(null);

    const [openOBPopup, setOpenOBPopup] = useState<boolean>(false);
    const [openKbShortcut, setOpenKbShortcut] = useState<boolean>(false);

    useEffect(() => {
        setName(localStorage.getItem("name"));
        setPhotoURL(localStorage.getItem("photoURL"));

        const alreadyClosed = localStorage.getItem("new-account-popup-closed")
        if (!alreadyClosed) {
            setOpenOBPopup(true)
        }

    }, []);

    const handleLogout = async () => {
        await signOut(auth);
        router.push("/api/auth/logout");
    };

    return (
        <>
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="rounded-full">
                        <Avatar>
                            {photoURL && <AvatarImage src={photoURL} alt="foto profilo" />}
                            <AvatarFallback>{name?.substring(0, 1).toUpperCase() || "U"}</AvatarFallback>
                        </Avatar>
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                    <DropdownMenuLabel>{name}</DropdownMenuLabel>
                    <Link href="/home">
                        <DropdownMenuItem>
                            <Book />
                            Visualizza i tuoi formulari
                        </DropdownMenuItem>
                    </Link>
                    <Link href="/community/page/1">
                        <DropdownMenuItem>
                            <Users />
                            Community
                        </DropdownMenuItem>
                    </Link>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onSelect={() => setOpenOBPopup(true)}>
                        <BadgeInfo />
                        Scopri come funziona
                    </DropdownMenuItem>
                    <DropdownMenuItem onSelect={() => setOpenKbShortcut(true)}>
                        <Keyboard />
                        Scorciatoie da tastiera
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <Link href="/terms">
                        <DropdownMenuItem>
                            <Handshake />
                            Termini e condizioni
                        </DropdownMenuItem>
                    </Link>
                    <Link href="/privacy">
                        <DropdownMenuItem>
                            <Cookie />
                            Privacy
                        </DropdownMenuItem>
                    </Link>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem variant="destructive" onClick={handleLogout}>
                        <LogOutIcon />
                        Sign Out
                    </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>
            <NewAccountPopup
                setOpen={setOpenOBPopup}
                open={openOBPopup}
            />
            <KbShortcuts
                setOpen={setOpenKbShortcut}
                open={openKbShortcut}
            />
        </>
    )
}