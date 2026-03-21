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
import { Book, Cookie, Handshake, LogOutIcon } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export function AvatarLogic() {
    const router = useRouter();
    const [name, setName] = useState<string | null>(null);
    const [photoURL, setPhotoURL] = useState<string | null>(null);

    useEffect(() => {
        setName(localStorage.getItem("name"));
        setPhotoURL(localStorage.getItem("photoURL"));
    }, []);

    const handleLogout = async () => {
        await signOut(auth);
        router.push("/api/auth/logout");
    };

    return (
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
                        Visualizza Formulari
                    </DropdownMenuItem>
                </Link>
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
    )
}